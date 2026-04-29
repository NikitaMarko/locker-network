import {Request, Response} from "express";


export class DeviceService {

    async openDeviceUser(req: Request, res: Response) {


        return res.status(200).send({message: "Not implemented yet"});
    }

    async closeDeviceUser(req: Request, res: Response) {


        return res.status(200).send({message: "Not implemented yet"});
    }

    async openDeviceOper(req: Request, res: Response) {


        return res.status(200).send({message: "Not implemented yet"});
    }

    async closeDeviceOper(req: Request, res: Response) {


        return res.status(200).send({message: "Not implemented yet"});
    }

}

export const deviceService = new DeviceService();