import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import bcrypt from 'bcrypt';
import { Model } from 'mongoose';

import { Account, AccountProvider } from '@/accounts/entities/accounts.entity';

@Injectable()
export class AccountsService {
  constructor(@InjectModel(Account.name) private account: Model<Account>) {}

  async createAccount(email: string, password: string) {
    const accountHolder = await this.account.findOne({ email }).lean();
    if (accountHolder) {
      throw new ConflictException('Email already exists');
    }

    const SALT = 10;
    const hashedPassword = await bcrypt.hash(password, SALT);

    await this.account.create({
      email,
      password: hashedPassword,
      provider: [AccountProvider.LOCAL],
    });
  }

  async findByEmail(email: string) {
    const account = await this.account.findOne({ email }).lean();
    return account;
  }

  async updateByEmail(
    email: string,
    updateData: Partial<Omit<Account, 'email'>>,
  ) {
    const account = await this.account.findOneAndUpdate(
      { email },
      { $set: updateData },
      { new: true },
    );
    return account;
  }

}
