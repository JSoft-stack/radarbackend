
import { Entity, PrimaryGeneratedColumn,Column } from "typeorm";

@Entity({name:'users'})
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable:true})
    username: string;

    @Column()
    user_id: string;

    @Column()
    first_name: string;

    @Column()
    last_name: string;

    @Column()
    lat: string;

    @Column()
    lon: string;

    @Column({nullable:true})
    last_active_time: string;

    @Column({type:'text', nullable:true})
    photo_url:string;

    @Column({type:'text', nullable:true})
    photo:string;
    
    @Column({default:false})
    hide: boolean;

}
