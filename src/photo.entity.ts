import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('photos')
export class Photo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url_photo: string;
}
