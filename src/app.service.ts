import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AppService {

  constructor(@InjectRepository(User) private readonly userRepository: Repository<User>){

  } 

  async getAll(){
    return this.userRepository.find()
  }

  async getById(user_id:string){
    return this.userRepository.findOneBy({user_id})
  }
  
  
  async create(user:Partial<User>){
    const newUser = this.userRepository.create(user)
    return this.userRepository.save(newUser)
  }

  async savelocation(user_id:string, lat:string, lon:string, last_active_time:string){
    return this.userRepository.update({user_id},{lat,lon,last_active_time})
  }


}
