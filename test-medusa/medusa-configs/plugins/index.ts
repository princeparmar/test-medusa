import { adminCategoryPlugin } from './admin-category'
import { customerRegistrationPlugin } from './customer-registration'
import { dynamicConfigPlugin } from './dynamic-config'
import { improveAdminPlugin } from './improve-admin'
import { productHelperPlugin } from './product-helper'
import { reviewRatingPlugin } from './review-rating'

export const pluginsConfig = [
  reviewRatingPlugin,
  adminCategoryPlugin,
  customerRegistrationPlugin,
  ...(process.env.ENABLE_IMPROVE_ADMIN === "true" ? [improveAdminPlugin] : []),
  dynamicConfigPlugin,
  productHelperPlugin,
]

export {
  adminCategoryPlugin,
  customerRegistrationPlugin,
  dynamicConfigPlugin,
  improveAdminPlugin,
  productHelperPlugin,
  reviewRatingPlugin,
}

