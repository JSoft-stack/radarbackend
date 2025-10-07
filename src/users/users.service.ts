import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) { }
  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  /**
   * Find users near given lat/lon within radius_km (default 5km)
   */
  async findNearby(user_id: number, lat: number, lon: number, radius_km = 5) {
    if (
      Number.isNaN(lat) ||
      Number.isNaN(lon) ||
      Math.abs(lat) > 90 ||
      Math.abs(lon) > 180
    ) {
      throw new BadRequestException('Invalid coordinates');
    }

    // Haversine/Great-circle distance formula using Earth's radius ~6371 km
    const distanceExpr = `
      6371 * acos(
      cos(radians($2)) * cos(radians(CAST(lat AS double precision))) *
      cos(radians(CAST(lon AS double precision)) - radians($3)) +
      sin(radians($2)) * sin(radians(CAST(lat AS double precision)))
      )
    `;

    const sql = `
      SELECT id, lat, lon, ${distanceExpr} AS distance_km
      FROM users
      WHERE ${distanceExpr} <= $4 AND user_id <> $1
      ORDER BY distance_km
    `;
    

    // Parameter order for $1,$2,$3,$4 must match both places: so repeat lat, lon where needed.
    // But note: we used same expression twice: first for select, second for where.
    // Provide parameters accordingly: [lat, lon, radius_km, limit]
    // For the duplicated expression in SELECT and WHERE, Postgres will substitute $1/$2 same values.
    const params = [user_id, lat, lon, radius_km];

    const rows = await this.userRepo.query(sql, params);
    return rows;
  }


  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}

