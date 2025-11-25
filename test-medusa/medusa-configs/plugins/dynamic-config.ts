export const dynamicConfigPlugin = {
  resolve: "medusa-plugin-dynamic-config",
  options: {
    configs: {
      "homepage-config": {
        "id": "homepage-config",
        "title": "Homepage Experiments",
        "active": true,
        "structure": [
          {
            "id": "homepage-banner-array",
            "title": "Homepage Banner Array",
            "type": "array",
            "children": [
              {
                "id": "homepage-banner",
                "title": "Homepage Banner",
                "type": "object",
                "children": [
                  {
                    "id": "homepage-banner-title",
                    "title": "Banner Title",
                    "type": "short-text",
                    "required": false
                  },
                  {
                    "id": "homepage-banner-subtitle",
                    "title": "Banner Subtitle",
                    "type": "short-text",
                    "required": false
                  },
                  {
                    "id": "homepage-banner-image",
                    "title": "Banner Image",
                    "type": "file",
                    "required": false
                  }
                ]
              },
            ]
          },
          {
            "id": "homepage-banner",
            "title": "Homepage Banner Copy",
            "type": "object",
            "children": [
              {
                "id": "homepage-banner-subtitle",
                "title": "Banner Subtitle",
                "defaultValue": "Limited time offer",
                "type": "short-text",
                "required": false
              }
            ]
          },
          {
            "id": "logo",
            "title": "Company Logo",
            "type": "file",
            "required": false
          }
        ]
      }
    }
  }
}

