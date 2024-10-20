"use client";

import CartItemLG from "@/components/cart/CartItemLG";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { TRANSACTION_FEE } from "@/lib/constants";
import { cn, formatPrice } from "@/lib/utils";
import { List, Product } from "@/payload-types";
import { trpc } from "@/trpc/client";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import ListActions from "./_components/ListActions";

type ListPageProps = {
  params: {
    listId: string;
  };
};

const ListPage = ({ params: { listId } }: ListPageProps) => {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const { loadItems } = useCart();

  let { data: user } = trpc.auth.getUser.useQuery();
  const { data: listData } = trpc.list.getList.useQuery<List>({
    id: listId,
  });
  const { mutate: addItems } = trpc.cart.addItemsToCart.useMutation({
    onSuccess({ updatedCart: { products } }) {
      // @ts-ignore TODO: Not sure what is the issue but it works
      loadItems(typeof products === "string" ? null : products);
      toast.success("Added to cart!");
    },
  });

  if (isMounted && !listData)
    return (
      <div className="bg-background">
        <p className="text-center pt-16 text-muted-foreground">
          No such List found!
        </p>
      </div>
    );

  let cartTotal = (listData?.products as Product[])?.reduce(
    (total, product) => total + product.price,
    0
  );

  const loadToCart = async () => {
    if (!listData?.products) {
      toast.error("Something went wrong, please try again later");
    }
    addItems({
      productIds:
        listData?.products?.map((product) =>
          typeof product === "string" ? product : product.id
        ) || [],
    });
  };
  return (
    <div className="bg-background">
      <div className="mx-auto max-w-2xl px-4 pb-24 pt-16 sm:px-6 lg:max-w-7xl lg:px-8">
        <div className="flex gap-2 md:justify-between md:items-center flex-col md:flex-row ">
          <h1 className="text-3xl font-bold tracking-tight text-foreground/90 sm:text-4xl">
            Shared Cart
          </h1>
          {user && listData && listData.products && (
            <ListActions user={user} list={listData} />
          )}
        </div>
        <p>
          Liked the products?
          <Button
            variant="link"
            size="sm"
            onClick={loadToCart}
            // disabled={IsListCreating}
          >
            Load to your cart
          </Button>
        </p>

        <div className="mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
          <div
            className={cn("lg:col-span-7", {
              "rounded-lg border-2 border-dashed border-zinc-200 p-12":
                isMounted && listData?.products?.length === 0,
            })}
          >
            <h2 className="sr-only">Items in your shopping cart</h2>

            {isMounted && listData?.products?.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center space-y-1">
                <div
                  aria-hidden="true"
                  className="relative mb-4 h-40 w-40 text-muted-foreground"
                >
                  <Image
                    src="/empty-cart.png"
                    layout="fill"
                    alt="Empty Cart"
                    loading="eager"
                  />
                </div>
                <h3 className="font-semibold text-2xl">Your cart is empty</h3>
                <p className="text-muted-foreground text-center ">
                  Woops! Looks like you haven&apos;t added anything to your cart
                  yet.
                </p>
              </div>
            ) : null}

            <ul
              className={cn({
                "divide-y divide-foreground/20 text-foreground/20 border-b border-t border-foreground/20":
                  isMounted && (listData?.products as Product[])?.length > 0,
              })}
            >
              {isMounted &&
                (listData?.products as Product[])?.map((product) => (
                  <CartItemLG key={product.id} product={product} />
                ))}
            </ul>
          </div>

          <section className="mt-16 rounded-lg bg-foreground/5 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8">
            <h2 className="font-medium text-foreground/90 text-lg">
              Order Summary
            </h2>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-foreground/60">Subtotal</p>
                <p className="font-medium text-foreground/90 text-sm">
                  {isMounted ? (
                    formatPrice(cartTotal)
                  ) : (
                    <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
                  )}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-foreground/20 text-foreground/20 pt-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <span>Flat Transaction fees</span>
                </div>
                <div className="text-sm font-medium text-foreground/90">
                  {isMounted ? (
                    formatPrice(Number(TRANSACTION_FEE))
                  ) : (
                    <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-muted text-foreground/20 pt-4">
                <div className="flex items-center text-base font-medium text-muted-foreground">
                  Order Total
                </div>
                <div className=" text-base font-medium text-foreground/90">
                  {isMounted ? (
                    formatPrice(cartTotal + Number(TRANSACTION_FEE))
                  ) : (
                    <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ListPage;
