export class CreateUserDto {
    user_id: string;
    first_name: string;
    last_name: string;
    lat: string;
    lon: string;
    last_active: string;
    hide: boolean;
    photo_url?: string; // добавлено поле для URL фото
    photo: string; // добавлено поле для локального пути к фото
    
}
