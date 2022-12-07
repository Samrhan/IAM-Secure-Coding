import {Column, Entity, PrimaryGeneratedColumn, Unique} from "typeorm";

@Entity()
@Unique(["email"])
export class UserEntity {
    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    firstname: string;


    @Column()
    lastname: string;


    @Column()
    email: string;


    @Column({select: false})
    password: string;

    constructor(firstname: string, lastname: string, email: string, password?: string) {
        this.firstname = firstname;
        this.lastname = lastname;
        this.email = email;
        this.password = password;
    }


}
