import {Column, Entity, JoinColumn, ManyToOne, PrimaryColumn} from "typeorm";
import {ApplicationEntity} from "./application.entity";

@Entity({name: "redirect_uri"})
export class RedirectUriEntity {
    @ManyToOne(() => ApplicationEntity, a => a.redirectUris)
    @JoinColumn({name: "application_id",  referencedColumnName: "id"})
    application: ApplicationEntity;

    @PrimaryColumn({name: "application_id"})
    applicationId: string;

    @PrimaryColumn({name: "redirect_uri"})
    redirectUri: string;

    constructor(application: ApplicationEntity, redirectUri: string) {
        this.application = application;
        this.redirectUri = redirectUri;
    }
}