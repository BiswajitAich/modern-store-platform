import { getAuthenticatedUser } from "@/app/_lib/customForServerSide";
import prisma from "@/lib/prisma";
import { cacheLife, cacheTag } from "next/cache";
import { redirect } from "next/navigation";

const getCartItems = async(userId: string)=>{
    "use cache";
    cacheLife("hours");
    cacheTag(`user-cart-&=${userId}`)
    try{
        const cartData = await prisma.wishlistItem.findMany({
            where:{
                userId,
            },
            select:{
                createdAt: true,
                product:{
                    select:{
                        name:  true,
                        
                    }
                },
                variant:{
                    select:{
                        stock: true,
                    }
                }
            }
        });
        return cartData;
    }catch(err){
        console.error(err);
        return [];
    }
}
const Cart = async() => {
    const user = await getAuthenticatedUser();
    if(user.role!=="user"){
        redirect("/auth");
    }
    const cartData = await getCartItems(user.id);
    console.log(cartData);
    
    return (
        <div>
            Enter
        </div>
    );
}

export default Cart;