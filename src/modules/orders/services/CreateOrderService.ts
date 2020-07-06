import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,
    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,
    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const customer = await this.customersRepository.findById(customer_id);

    if (!customer) {
      throw new AppError('Invalid customer!', 400);
    }

    const ids = products.map(product => {
      return { id: product.id };
    });

    const productsObjects = await this.productsRepository.findAllById(ids);

    if (productsObjects.length !== products.length) {
      throw new AppError('A least one product from order was not found', 400);
    }

    const productsToUpdate: IProduct[] = [];

    const pricedProducts = productsObjects.map(product => {
      const orderQuantity = products.find(
        equivalentProduct => equivalentProduct.id === product.id,
      )?.quantity;

      if (!orderQuantity || product.quantity - orderQuantity < 0) {
        throw new AppError('Order quantity not provided or not enough supply');
      }

      productsToUpdate.push({
        id: product.id,
        quantity: product.quantity - orderQuantity,
      });

      return {
        product_id: product.id,
        price: product.price,
        quantity: orderQuantity,
      };
    });

    const order = await this.ordersRepository.create({
      customer,
      products: pricedProducts,
    });

    await this.productsRepository.updateQuantity(productsToUpdate);

    return order;
  }
}

export default CreateOrderService;
