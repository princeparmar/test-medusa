export const productHelperPlugin = {
  resolve: "medusa-product-helper",
  options: {
    metadata: {
      products: {
        expose_client_helpers: true,
        descriptors: [
          {
            key: "brand",
            label: "Brand",
            type: "text",
            filterable: true,
          },
          {
            key: "material",
            label: "Material",
            type: "text",
            filterable: true,
          },
          {
            key: "warranty_years",
            label: "Warranty (Years)",
            type: "number",
            filterable: true,
          },
          {
            key: "is_eco_friendly",
            label: "Eco Friendly",
            type: "bool",
            filterable: true,
          },
          {
            key: "certification_file",
            label: "Certification Document",
            type: "file",
          },
        ],
      },
      categories: {
        descriptors: [
          {
            key: "taxonomy_label",
            label: "Taxonomy Label",
            type: "text",
          },
          {
            key: "category_banner",
            label: "Category Banner",
            type: "file",
          },
        ],
      },
    },
    default_price_range: {
      label: "custom",
      min: null,
      max: null,
    },
    promotion_window: {
      start_metadata_key: "promotion_start",
      end_metadata_key: "promotion_end",
      treat_open_ended_as_active: true,
    },
    availability: {
      require_in_stock: false,
      include_preorder: true,
      include_backorder: true,
      include_gift_cards: false,
      publishable_only: true,
    },
    rating: {
      enabled: true,
      min: 0,
      max: 5,
      require_reviews: false,
    },
  },
}

