import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Check, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { useCartStore } from "@/lib/cart";
import {
  formatAvailability,
  formatPublicPrice,
  isProductInStock,
  toCartItem,
  type PublicProductSummary,
} from "@/lib/api/public-catalog";

export function PublicProductCard({ product }: { product: PublicProductSummary }) {
  const addItem = useCartStore((state) => state.addItem);
  const [added, setAdded] = useState(false);
  const inStock = isProductInStock(product.availability);
  function addToQuote() {
    addItem(toCartItem(product));
    setAdded(true);
    toast.success("Produto adicionado ao orçamento");
  }
  return (
    <article className="store-product-card">
      <Link
        to="/produtos/$id"
        params={{ id: product.erpId }}
        className="store-product-card__image"
        aria-label={`Ver ${product.name}`}
      >
        <ImageWithFallback
          src={product.primaryImageUrl ?? ""}
          alt={product.name}
          loading="lazy"
          width={480}
          height={480}
          className="store-product-image"
        />
        <span className="store-product-card__arrow">
          <ArrowUpRight size={19} aria-hidden="true" />
        </span>
      </Link>
      <div className="store-product-card__body">
        <span className="store-product-card__brand">
          {product.manufacturer ?? "Pizzatto seleciona"}
        </span>
        <Link
          to="/produtos/$id"
          params={{ id: product.erpId }}
          className="store-product-card__name"
        >
          <h3 title={product.name}>{product.name}</h3>
        </Link>
        <p className="store-product-card__reference">Ref. {product.reference ?? product.erpId}</p>
        <p className={`store-product-card__stock ${inStock ? "is-available" : ""}`}>
          <span aria-hidden="true" />
          {formatAvailability(product.availability)}
        </p>
        <div className="store-product-card__bottom">
          <div>
            <span className="store-product-card__price-label">
              {product.price !== null && product.price > 0
                ? "Valor do produto"
                : "Fale com a gente"}
            </span>
            <strong>{formatPublicPrice(product.price)}</strong>
          </div>
          <button
            type="button"
            onClick={addToQuote}
            aria-label={`Adicionar ${product.name} ao orçamento`}
            className={added ? "is-added" : ""}
          >
            {added ? <Check size={22} aria-hidden="true" /> : <Plus size={23} aria-hidden="true" />}
          </button>
        </div>
        <Link to="/produtos/$id" params={{ id: product.erpId }} className="store-product-card__cta">
          Conhecer produto <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
