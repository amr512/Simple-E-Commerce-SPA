let obj={
    
// {
//     id: NIL,
//     email: "admin@bricks.store",
//     password: "admin123", // should probably hash this if there's time
//     name: "Admin",
//     orderIds: [], // for easier access (redundant info, might remove)
//     seller: true,
//     storeID: NIL,
//     paymentMethod: undefined,
//     deleted: false, // may be useful????
//     address: undefined, // could change to an array ,
//     phone: "0123456789"
// }


    /* 
    -------------------------------------------------------------------------------- 
    |                              user structure                                  |
    -------------------------------------------------------------------------------- 
    */
    /* user: {
        id: string, // auto-generated
        email: string,
        password: string, // should probably hash this if there's time
        name: string,
        orderIds: string[], // for easier access (redundant info, might remove)
        seller: boolean,
        paymentMethod:string,
        deleted: boolean, // may be useful????
        address: string // could change to an array ,
        phone: number
    }*/ 
    users: [],

    stores:[],
    /* 
    -------------------------------------------------------------------------------- 
    |                              product structure                               |
    -------------------------------------------------------------------------------- 
    */
    /* product: {
        id: string,
        name: string, // readable name
        path: string, // not-so-readable short url
        description: string,
        price: number,
        category: string,
        images: string[],
    }*/
    products: [],
    /* 
    -------------------------------------------------------------------------------- 
    |                              review structure                                |
    -------------------------------------------------------------------------------- 
    */
    /* review:{
        id: string, // probably not useful
        product-id: string,
        user-id: string,
        price: number,
        rating: number // 0 < value <= 5,
        review: string // optional 
    }*/
    reviews:[],
    /* 
    -------------------------------------------------------------------------------- 
    |                              order structure                                 |
    -------------------------------------------------------------------------------- 
    */
    /* order:{
        id: string // probably not useful here
        products:{
            id:string,
            purchase-price: number // stored here in case it changes after the order
        },
        user-id: string,
        user-address: string, 
        // stored here so it doesn't change 
        // if user changes his address after ordering 
    }*/
    orders:[]
}