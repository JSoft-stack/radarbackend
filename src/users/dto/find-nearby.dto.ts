import { IsNumberString, IsOptional } from 'class-validator';

export class FindNearbyDto {

  @IsNumberString()
  user_id:string;

  @IsNumberString()
  lat: string;

  @IsNumberString()
  lon: string;

  @IsOptional()
  @IsNumberString()
  radius?: string; // km
}
