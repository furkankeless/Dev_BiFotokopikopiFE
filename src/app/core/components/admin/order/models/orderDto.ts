export class OrderDto{
    id?:number; 
    createdUserId?:number; 
    createdDate?:(Date | any); 
    lastUpdatedUserId?:number; 
    lastUpdatedDate?:(Date | any); 
    status:boolean; 
    isDeleted:boolean; 
    customerId?:number; 
    productId?:number; 
    amount?:number; 
    size?:string; 
    costumerName:string;
    productName:string;
}