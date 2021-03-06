import { getRepository, Repository, In, getManager } from 'typeorm';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICreateProductDTO from '@modules/products/dtos/ICreateProductDTO';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
import AppError from '@shared/errors/AppError';
import Product from '../entities/Product';

interface IFindProducts {
  id: string;
}

class ProductsRepository implements IProductsRepository {
  private ormRepository: Repository<Product>;

  constructor() {
    this.ormRepository = getRepository(Product);
  }

  public async create({
    name,
    price,
    quantity,
  }: ICreateProductDTO): Promise<Product> {
    const product = this.ormRepository.create({
      name,
      price,
      quantity,
    });

    await this.ormRepository.save(product);

    return product;
  }

  public async findByName(name: string): Promise<Product | undefined> {
    const existName = await this.ormRepository.findOne({
      where: {
        name,
      },
    });

    return existName;
  }

  public async findAllById(products: IFindProducts[]): Promise<Product[]> {
    const ids = products.map(product => product.id);

    const productsObjects = await this.ormRepository.find({
      where: {
        id: In(ids),
      },
    });

    return productsObjects;
  }

  public async updateQuantity(
    products: IUpdateProductsQuantityDTO[],
  ): Promise<Product[]> {
    await getManager().transaction(async transactionalManager => {
      products.forEach(async product => {
        await transactionalManager.update(Product, product.id, {
          quantity: product.quantity,
        });
      });
    });

    const ids = products.map(product => product.id);

    const updatedProducts = await this.ormRepository.findByIds(ids);

    return updatedProducts;
  }
}

export default ProductsRepository;
