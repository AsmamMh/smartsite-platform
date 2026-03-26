import { NotificationApi } from "@/lib/api-client"



export const getMyNotifications= async ()=>{
    const {data} = await NotificationApi.get('/mynotifications')
    return data;
}