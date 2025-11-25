export const improveAdminPlugin = {
  resolve: "medusa-improve-admin",
  options: {
    metadataDescriptors: [
      {
        key: "warranty_period",
        label: "Warranty Period (months)",
        type: "number",
      },
      {
        key: "product_description",
        label: "Product Description",
        type: "text",
      },
      {
        key: "product_manual",
        label: "Product Manual URL",
        type: "file",
      },
      {
        key: "is_featured",
        label: "Featured Product",
        type: "bool",
      },
      {
        key: "manufacturer",
        label: "Manufacturer",
        type: "text",
      },
      {
        key: "model_number",
        label: "Model Number",
        type: "text",
      },
    ],
  },
}

