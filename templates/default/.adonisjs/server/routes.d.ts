import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'products.index': { paramsTuple?: []; params?: {} }
    'products.search': { paramsTuple?: []; params?: {} }
    'products.featured': { paramsTuple?: []; params?: {} }
    'products.new_arrivals': { paramsTuple?: []; params?: {} }
    'products.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'products.variants': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'products.related': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'categories.index': { paramsTuple?: []; params?: {} }
    'categories.tree': { paramsTuple?: []; params?: {} }
    'categories.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'categories.breadcrumb': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'cart.show': { paramsTuple?: []; params?: {} }
    'cart.clear': { paramsTuple?: []; params?: {} }
    'cart.add_item': { paramsTuple?: []; params?: {} }
    'cart.update_item': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'cart.remove_item': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'cart.apply_discount': { paramsTuple?: []; params?: {} }
    'cart.remove_discount': { paramsTuple?: []; params?: {} }
    'customers.register': { paramsTuple?: []; params?: {} }
    'customers.login': { paramsTuple?: []; params?: {} }
    'customers.logout': { paramsTuple?: []; params?: {} }
    'customers.me': { paramsTuple?: []; params?: {} }
    'customers.update': { paramsTuple?: []; params?: {} }
    'customers.addresses': { paramsTuple?: []; params?: {} }
    'customers.add_address': { paramsTuple?: []; params?: {} }
    'customers.update_address': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'customers.delete_address': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'customers.wishlist': { paramsTuple?: []; params?: {} }
    'customers.add_to_wishlist': { paramsTuple?: []; params?: {} }
    'customers.remove_from_wishlist': { paramsTuple: [ParamValue]; params: {'productId': ParamValue} }
    'orders.store': { paramsTuple?: []; params?: {} }
    'orders.track': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'orders.index': { paramsTuple?: []; params?: {} }
    'orders.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'orders.cancel': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'digital_products.upload': { paramsTuple?: []; params?: {} }
    'digital_products.get_download_link': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'digital_products.record_download': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'digital_products.revoke_download': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'digital_products.get_customer_downloads': { paramsTuple: [ParamValue]; params: {'customerId': ParamValue} }
    'digital_products.validate_license': { paramsTuple?: []; params?: {} }
    'digital_products.activate_license': { paramsTuple?: []; params?: {} }
    'digital_products.deactivate_license': { paramsTuple?: []; params?: {} }
    'digital_products.suspend_license': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'digital_products.get_customer_licenses': { paramsTuple: [ParamValue]; params: {'customerId': ParamValue} }
    'subscriptions.create': { paramsTuple?: []; params?: {} }
    'subscriptions.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'subscriptions.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'subscriptions.pause': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'subscriptions.resume': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'subscriptions.cancel': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'subscriptions.renew': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'subscriptions.get_customer_subscriptions': { paramsTuple: [ParamValue]; params: {'customerId': ParamValue} }
    'subscriptions.add_item': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'subscriptions.update_item': { paramsTuple: [ParamValue]; params: {'itemId': ParamValue} }
    'subscriptions.remove_item': { paramsTuple: [ParamValue]; params: {'itemId': ParamValue} }
    'subscriptions.stripe_webhook': { paramsTuple?: []; params?: {} }
    'bundles.create': { paramsTuple?: []; params?: {} }
    'bundles.index': { paramsTuple?: []; params?: {} }
    'bundles.available': { paramsTuple?: []; params?: {} }
    'bundles.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'bundles.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'bundles.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'bundles.pricing': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'bundles.duplicate': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'bundles.validate_stock': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'quantity': ParamValue} }
    'bundles.get_by_product': { paramsTuple: [ParamValue]; params: {'productId': ParamValue} }
    'bundles.add_item': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'bundles.update_item': { paramsTuple: [ParamValue]; params: {'itemId': ParamValue} }
    'bundles.remove_item': { paramsTuple: [ParamValue]; params: {'itemId': ParamValue} }
    'bundles.reorder_items': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'images.upload': { paramsTuple?: []; params?: {} }
    'images.batch_upload': { paramsTuple?: []; params?: {} }
    'images.optimize': { paramsTuple?: []; params?: {} }
    'images.convert_to_web_p': { paramsTuple?: []; params?: {} }
    'images.get_image_urls': { paramsTuple?: []; params?: {} }
    'images.get_dimensions': { paramsTuple?: []; params?: {} }
    'images.get_metadata': { paramsTuple?: []; params?: {} }
    'health': { paramsTuple?: []; params?: {} }
    'seo.robots': { paramsTuple?: []; params?: {} }
    'seo.sitemap': { paramsTuple?: []; params?: {} }
    'seo.sitemapIndex': { paramsTuple?: []; params?: {} }
    'seo.webManifest': { paramsTuple?: []; params?: {} }
    'seo.organization': { paramsTuple?: []; params?: {} }
    'storefront.home': { paramsTuple?: []; params?: {} }
    'storefront.search': { paramsTuple?: []; params?: {} }
    'storefront.search.suggestions': { paramsTuple?: []; params?: {} }
    'storefront.newsletter.subscribe': { paramsTuple?: []; params?: {} }
    'storefront.about': { paramsTuple?: []; params?: {} }
    'storefront.contact': { paramsTuple?: []; params?: {} }
    'storefront.contact.submit': { paramsTuple?: []; params?: {} }
    'storefront.pages.show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'storefront.blog.index': { paramsTuple?: []; params?: {} }
    'storefront.blog.show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'storefront.shipping': { paramsTuple?: []; params?: {} }
    'storefront.returns': { paramsTuple?: []; params?: {} }
    'storefront.faq': { paramsTuple?: []; params?: {} }
    'storefront.privacy': { paramsTuple?: []; params?: {} }
    'storefront.terms': { paramsTuple?: []; params?: {} }
    'storefront.products.index': { paramsTuple?: []; params?: {} }
    'storefront.products.show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'storefront.products.submitReview': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'storefront.category': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'storefront.collections': { paramsTuple?: []; params?: {} }
    'storefront.collections.show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'storefront.categories': { paramsTuple?: []; params?: {} }
    'storefront.compare': { paramsTuple?: []; params?: {} }
    'storefront.orderTracking': { paramsTuple?: []; params?: {} }
    'storefront.wishlist': { paramsTuple?: []; params?: {} }
    'storefront.wishlist.add': { paramsTuple?: []; params?: {} }
    'storefront.wishlist.remove': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'storefront.cart': { paramsTuple?: []; params?: {} }
    'storefront.cart.add': { paramsTuple?: []; params?: {} }
    'storefront.cart.update': { paramsTuple: [ParamValue]; params: {'itemId': ParamValue} }
    'storefront.cart.remove': { paramsTuple: [ParamValue]; params: {'itemId': ParamValue} }
    'storefront.cart.clear': { paramsTuple?: []; params?: {} }
    'storefront.cart.applyDiscount': { paramsTuple?: []; params?: {} }
    'storefront.cart.removeDiscount': { paramsTuple?: []; params?: {} }
    'storefront.checkout': { paramsTuple?: []; params?: {} }
    'storefront.checkout.process': { paramsTuple?: []; params?: {} }
    'storefront.checkout.payment': { paramsTuple: [ParamValue]; params: {'orderId': ParamValue} }
    'storefront.checkout.processPayment': { paramsTuple: [ParamValue]; params: {'orderId': ParamValue} }
    'storefront.checkout.confirmation': { paramsTuple: [ParamValue]; params: {'orderId': ParamValue} }
    'webhooks.stripe': { paramsTuple?: []; params?: {} }
    'webhooks.iyzico': { paramsTuple?: []; params?: {} }
    'auth.social.redirect': { paramsTuple: [ParamValue]; params: {'provider': ParamValue} }
    'auth.social.callback': { paramsTuple: [ParamValue]; params: {'provider': ParamValue} }
    'storefront.account.login': { paramsTuple?: []; params?: {} }
    'storefront.account.login.post': { paramsTuple?: []; params?: {} }
    'storefront.account.register': { paramsTuple?: []; params?: {} }
    'storefront.account.register.post': { paramsTuple?: []; params?: {} }
    'storefront.account.logout': { paramsTuple?: []; params?: {} }
    'storefront.account.forgotPassword': { paramsTuple?: []; params?: {} }
    'storefront.account.forgotPassword.post': { paramsTuple?: []; params?: {} }
    'storefront.account.resetPassword': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'storefront.account.resetPassword.post': { paramsTuple?: []; params?: {} }
    'storefront.account.dashboard': { paramsTuple?: []; params?: {} }
    'storefront.account.orders': { paramsTuple?: []; params?: {} }
    'storefront.account.orders.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'storefront.account.reviews': { paramsTuple?: []; params?: {} }
    'storefront.account.profile': { paramsTuple?: []; params?: {} }
    'storefront.account.profile.update': { paramsTuple?: []; params?: {} }
    'storefront.account.password.update': { paramsTuple?: []; params?: {} }
    'storefront.account.addresses': { paramsTuple?: []; params?: {} }
    'storefront.account.addresses.add': { paramsTuple?: []; params?: {} }
    'storefront.account.addresses.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'storefront.account.addresses.delete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.auth.login': { paramsTuple?: []; params?: {} }
    'admin.auth.login.post': { paramsTuple?: []; params?: {} }
    'admin.auth.2fa': { paramsTuple?: []; params?: {} }
    'admin.auth.2fa.verify': { paramsTuple?: []; params?: {} }
    'admin.auth.forgotPassword': { paramsTuple?: []; params?: {} }
    'admin.auth.forgotPassword.post': { paramsTuple?: []; params?: {} }
    'admin.auth.resetPassword': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'admin.auth.resetPassword.post': { paramsTuple?: []; params?: {} }
    'admin.auth.logout': { paramsTuple?: []; params?: {} }
    'admin.dashboard': { paramsTuple?: []; params?: {} }
    'admin.dashboard.alias': { paramsTuple?: []; params?: {} }
    'admin.analytics': { paramsTuple?: []; params?: {} }
    'admin.profile': { paramsTuple?: []; params?: {} }
    'admin.profile.update': { paramsTuple?: []; params?: {} }
    'admin.profile.password': { paramsTuple?: []; params?: {} }
    'admin.profile.2fa.enable': { paramsTuple?: []; params?: {} }
    'admin.profile.2fa.confirm': { paramsTuple?: []; params?: {} }
    'admin.profile.2fa.disable': { paramsTuple?: []; params?: {} }
    'admin.products.index': { paramsTuple?: []; params?: {} }
    'admin.products.importPage': { paramsTuple?: []; params?: {} }
    'admin.products.import.process': { paramsTuple?: []; params?: {} }
    'admin.products.exportPage': { paramsTuple?: []; params?: {} }
    'admin.products.export.download': { paramsTuple?: []; params?: {} }
    'admin.products.template': { paramsTuple?: []; params?: {} }
    'admin.products.create': { paramsTuple?: []; params?: {} }
    'admin.products.store': { paramsTuple?: []; params?: {} }
    'admin.products.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.products.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.products.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.products.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.products.duplicate': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.products.bulk': { paramsTuple?: []; params?: {} }
    'admin.upload.images': { paramsTuple?: []; params?: {} }
    'admin.categories.index': { paramsTuple?: []; params?: {} }
    'admin.categories.create': { paramsTuple?: []; params?: {} }
    'admin.categories.store': { paramsTuple?: []; params?: {} }
    'admin.categories.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.categories.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.categories.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.categories.reorder': { paramsTuple?: []; params?: {} }
    'admin.orders.index': { paramsTuple?: []; params?: {} }
    'admin.orders.export': { paramsTuple?: []; params?: {} }
    'admin.orders.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.orders.updateStatus': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.orders.cancel': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.orders.addNote': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.orders.fulfillments.create': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.orders.fulfillments.ship': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'fulfillmentId': ParamValue} }
    'admin.orders.fulfillments.deliver': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'fulfillmentId': ParamValue} }
    'admin.orders.fulfillments.cancel': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'fulfillmentId': ParamValue} }
    'admin.orders.refunds.create': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.orders.invoice': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.orders.returns.create': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.orders.returns.receive': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'returnId': ParamValue} }
    'admin.orders.returns.cancel': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'returnId': ParamValue} }
    'admin.orders.returns.complete': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'returnId': ParamValue} }
    'admin.orders.claims.create': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.orders.claims.update': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'claimId': ParamValue} }
    'admin.orders.exchanges.create': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.orders.exchanges.update': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'exchangeId': ParamValue} }
    'admin.orders.edits.create': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.orders.edits.request': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'editId': ParamValue} }
    'admin.orders.edits.confirm': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'editId': ParamValue} }
    'admin.orders.edits.decline': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'editId': ParamValue} }
    'admin.draftOrders.index': { paramsTuple?: []; params?: {} }
    'admin.draftOrders.create': { paramsTuple?: []; params?: {} }
    'admin.draftOrders.store': { paramsTuple?: []; params?: {} }
    'admin.draftOrders.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.draftOrders.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.draftOrders.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.draftOrders.registerPayment': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.giftCards.index': { paramsTuple?: []; params?: {} }
    'admin.giftCards.create': { paramsTuple?: []; params?: {} }
    'admin.giftCards.store': { paramsTuple?: []; params?: {} }
    'admin.giftCards.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.giftCards.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.giftCards.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.giftCards.adjust': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.giftCards.toggle': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.customers.index': { paramsTuple?: []; params?: {} }
    'admin.customers.create': { paramsTuple?: []; params?: {} }
    'admin.customers.store': { paramsTuple?: []; params?: {} }
    'admin.customers.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.customers.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.customers.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.customers.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.customers.updateStatus': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.customers.updatePassword': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.customers.addresses.add': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.customers.addresses.update': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'addressId': ParamValue} }
    'admin.customers.addresses.delete': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'addressId': ParamValue} }
    'admin.discounts.index': { paramsTuple?: []; params?: {} }
    'admin.discounts.create': { paramsTuple?: []; params?: {} }
    'admin.discounts.store': { paramsTuple?: []; params?: {} }
    'admin.discounts.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.discounts.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.discounts.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.discounts.toggle': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.priceLists.index': { paramsTuple?: []; params?: {} }
    'admin.priceLists.create': { paramsTuple?: []; params?: {} }
    'admin.priceLists.store': { paramsTuple?: []; params?: {} }
    'admin.priceLists.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.priceLists.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.priceLists.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.priceLists.rules': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.priceLists.prices.add': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.priceLists.prices.remove': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.inventory.index': { paramsTuple?: []; params?: {} }
    'admin.inventory.locations': { paramsTuple?: []; params?: {} }
    'admin.inventory.locations.create': { paramsTuple?: []; params?: {} }
    'admin.inventory.locations.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.inventory.variant': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.inventory.adjust': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.inventory.set': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.inventory.transfer': { paramsTuple?: []; params?: {} }
    'admin.inventory.bulk': { paramsTuple?: []; params?: {} }
    'admin.settings.index': { paramsTuple?: []; params?: {} }
    'admin.settings.general': { paramsTuple?: []; params?: {} }
    'admin.settings.update': { paramsTuple?: []; params?: {} }
    'admin.settings.taxes': { paramsTuple?: []; params?: {} }
    'admin.settings.taxes.classes.create': { paramsTuple?: []; params?: {} }
    'admin.settings.taxes.classes.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.taxes.classes.delete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.taxes.rates.create': { paramsTuple: [ParamValue]; params: {'classId': ParamValue} }
    'admin.settings.taxes.rates.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.taxes.rates.delete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.currencies': { paramsTuple?: []; params?: {} }
    'admin.settings.currencies.create': { paramsTuple?: []; params?: {} }
    'admin.settings.currencies.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.locales': { paramsTuple?: []; params?: {} }
    'admin.settings.locales.create': { paramsTuple?: []; params?: {} }
    'admin.settings.locales.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.payments': { paramsTuple?: []; params?: {} }
    'admin.settings.shipping': { paramsTuple?: []; params?: {} }
    'admin.customizer.editor': { paramsTuple: [ParamValue,ParamValue?]; params: {'pageType': ParamValue,'pageId'?: ParamValue} }
    'admin.customizer.save': { paramsTuple: [ParamValue]; params: {'pageType': ParamValue} }
    'admin.ai.generate': { paramsTuple?: []; params?: {} }
    'admin.ai.imageToComponent': { paramsTuple?: []; params?: {} }
    'admin.settings.ai': { paramsTuple?: []; params?: {} }
    'admin.content.pages': { paramsTuple?: []; params?: {} }
    'admin.content.pages.create': { paramsTuple?: []; params?: {} }
    'admin.content.pages.store': { paramsTuple?: []; params?: {} }
    'admin.content.pages.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.content.pages.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.content.pages.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.content.menus': { paramsTuple?: []; params?: {} }
    'admin.content.menus.store': { paramsTuple?: []; params?: {} }
    'admin.content.menus.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.content.menus.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.content.menus.items.store': { paramsTuple: [ParamValue]; params: {'menuId': ParamValue} }
    'admin.content.menus.items.update': { paramsTuple: [ParamValue,ParamValue]; params: {'menuId': ParamValue,'itemId': ParamValue} }
    'admin.content.menus.items.destroy': { paramsTuple: [ParamValue,ParamValue]; params: {'menuId': ParamValue,'itemId': ParamValue} }
    'admin.content.banners': { paramsTuple?: []; params?: {} }
    'admin.content.banners.store': { paramsTuple?: []; params?: {} }
    'admin.content.banners.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.content.banners.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.blog.index': { paramsTuple?: []; params?: {} }
    'admin.blog.create': { paramsTuple?: []; params?: {} }
    'admin.blog.store': { paramsTuple?: []; params?: {} }
    'admin.blog.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.blog.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.blog.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.blog.categories': { paramsTuple?: []; params?: {} }
    'admin.blog.categories.store': { paramsTuple?: []; params?: {} }
    'admin.blog.categories.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.blog.categories.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.reviews.index': { paramsTuple?: []; params?: {} }
    'admin.reviews.updateStatus': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.reviews.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.marketing.index': { paramsTuple?: []; params?: {} }
    'admin.marketing.abandonedCarts': { paramsTuple?: []; params?: {} }
    'admin.marketing.abandonedCarts.recover': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.marketing.abandonedCarts.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.marketing.emailCampaigns': { paramsTuple?: []; params?: {} }
    'admin.marketing.emailCampaigns.store': { paramsTuple?: []; params?: {} }
    'admin.marketing.emailCampaigns.send': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.marketing.emailCampaigns.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.webhooks': { paramsTuple?: []; params?: {} }
    'admin.settings.webhooks.create': { paramsTuple?: []; params?: {} }
    'admin.settings.webhooks.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.webhooks.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.webhooks.test': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.webhooks.logs': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.users': { paramsTuple?: []; params?: {} }
    'admin.settings.users.create': { paramsTuple?: []; params?: {} }
    'admin.settings.users.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.users.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.roles': { paramsTuple?: []; params?: {} }
    'admin.settings.roles.create': { paramsTuple?: []; params?: {} }
    'admin.settings.roles.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.roles.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.redirects': { paramsTuple?: []; params?: {} }
    'admin.settings.redirects.create': { paramsTuple?: []; params?: {} }
    'admin.settings.redirects.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.redirects.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.seo': { paramsTuple?: []; params?: {} }
    'admin.settings.seo.update': { paramsTuple?: []; params?: {} }
    'admin.settings.store': { paramsTuple?: []; params?: {} }
    'admin.settings.store.update': { paramsTuple?: []; params?: {} }
    'admin.settings.attributes': { paramsTuple?: []; params?: {} }
    'admin.settings.attributes.create': { paramsTuple?: []; params?: {} }
    'admin.settings.attributes.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.attributes.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.regions': { paramsTuple?: []; params?: {} }
    'admin.settings.regions.create': { paramsTuple?: []; params?: {} }
    'admin.settings.regions.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.regions.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.regions.countries.add': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.regions.countries.remove': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'countryCode': ParamValue} }
    'admin.settings.salesChannels': { paramsTuple?: []; params?: {} }
    'admin.settings.salesChannels.create': { paramsTuple?: []; params?: {} }
    'admin.settings.salesChannels.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.salesChannels.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.salesChannels.products.add': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.salesChannels.products.remove': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.customerGroups': { paramsTuple?: []; params?: {} }
    'admin.settings.customerGroups.create': { paramsTuple?: []; params?: {} }
    'admin.settings.customerGroups.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.customerGroups.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.customerGroups.customers.add': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.customerGroups.customers.remove': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.shippingProfiles': { paramsTuple?: []; params?: {} }
    'admin.settings.shippingProfiles.create': { paramsTuple?: []; params?: {} }
    'admin.settings.shippingProfiles.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.shippingProfiles.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.apiKeys': { paramsTuple?: []; params?: {} }
    'admin.settings.apiKeys.create': { paramsTuple?: []; params?: {} }
    'admin.settings.apiKeys.revoke': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.apiKeys.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.returnReasons': { paramsTuple?: []; params?: {} }
    'admin.settings.returnReasons.create': { paramsTuple?: []; params?: {} }
    'admin.settings.returnReasons.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.returnReasons.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.integrations': { paramsTuple?: []; params?: {} }
    'admin.settings.payments.provider': { paramsTuple?: []; params?: {} }
    'admin.settings.shipping.method': { paramsTuple?: []; params?: {} }
    'admin.settings.cache': { paramsTuple?: []; params?: {} }
    'admin.settings.cache.clear': { paramsTuple?: []; params?: {} }
    'admin.plugins.index': { paramsTuple?: []; params?: {} }
    'admin.plugins.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.plugins.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.plugins.settings': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.analytics.sales': { paramsTuple?: []; params?: {} }
    'admin.analytics.products': { paramsTuple?: []; params?: {} }
    'admin.analytics.customers': { paramsTuple?: []; params?: {} }
    'admin.collections': { paramsTuple?: []; params?: {} }
    'admin.collections.create': { paramsTuple?: []; params?: {} }
    'admin.collections.store': { paramsTuple?: []; params?: {} }
    'admin.collections.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.collections.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.collections.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.inventory.export': { paramsTuple?: []; params?: {} }
    'admin.inventory.importPage': { paramsTuple?: []; params?: {} }
    'admin.inventory.export.download': { paramsTuple?: []; params?: {} }
    'admin.inventory.import.process': { paramsTuple?: []; params?: {} }
    'admin.inventory.template': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'products.index': { paramsTuple?: []; params?: {} }
    'products.search': { paramsTuple?: []; params?: {} }
    'products.featured': { paramsTuple?: []; params?: {} }
    'products.new_arrivals': { paramsTuple?: []; params?: {} }
    'products.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'products.variants': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'products.related': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'categories.index': { paramsTuple?: []; params?: {} }
    'categories.tree': { paramsTuple?: []; params?: {} }
    'categories.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'categories.breadcrumb': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'cart.show': { paramsTuple?: []; params?: {} }
    'customers.me': { paramsTuple?: []; params?: {} }
    'customers.addresses': { paramsTuple?: []; params?: {} }
    'customers.wishlist': { paramsTuple?: []; params?: {} }
    'orders.track': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'orders.index': { paramsTuple?: []; params?: {} }
    'orders.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'digital_products.get_download_link': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'digital_products.get_customer_downloads': { paramsTuple: [ParamValue]; params: {'customerId': ParamValue} }
    'digital_products.suspend_license': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'digital_products.get_customer_licenses': { paramsTuple: [ParamValue]; params: {'customerId': ParamValue} }
    'subscriptions.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'subscriptions.get_customer_subscriptions': { paramsTuple: [ParamValue]; params: {'customerId': ParamValue} }
    'bundles.index': { paramsTuple?: []; params?: {} }
    'bundles.available': { paramsTuple?: []; params?: {} }
    'bundles.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'bundles.pricing': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'bundles.validate_stock': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'quantity': ParamValue} }
    'bundles.get_by_product': { paramsTuple: [ParamValue]; params: {'productId': ParamValue} }
    'images.get_image_urls': { paramsTuple?: []; params?: {} }
    'images.get_dimensions': { paramsTuple?: []; params?: {} }
    'images.get_metadata': { paramsTuple?: []; params?: {} }
    'health': { paramsTuple?: []; params?: {} }
    'seo.robots': { paramsTuple?: []; params?: {} }
    'seo.sitemap': { paramsTuple?: []; params?: {} }
    'seo.sitemapIndex': { paramsTuple?: []; params?: {} }
    'seo.webManifest': { paramsTuple?: []; params?: {} }
    'seo.organization': { paramsTuple?: []; params?: {} }
    'storefront.home': { paramsTuple?: []; params?: {} }
    'storefront.search': { paramsTuple?: []; params?: {} }
    'storefront.search.suggestions': { paramsTuple?: []; params?: {} }
    'storefront.about': { paramsTuple?: []; params?: {} }
    'storefront.contact': { paramsTuple?: []; params?: {} }
    'storefront.pages.show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'storefront.blog.index': { paramsTuple?: []; params?: {} }
    'storefront.blog.show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'storefront.shipping': { paramsTuple?: []; params?: {} }
    'storefront.returns': { paramsTuple?: []; params?: {} }
    'storefront.faq': { paramsTuple?: []; params?: {} }
    'storefront.privacy': { paramsTuple?: []; params?: {} }
    'storefront.terms': { paramsTuple?: []; params?: {} }
    'storefront.products.index': { paramsTuple?: []; params?: {} }
    'storefront.products.show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'storefront.category': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'storefront.collections': { paramsTuple?: []; params?: {} }
    'storefront.collections.show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'storefront.categories': { paramsTuple?: []; params?: {} }
    'storefront.compare': { paramsTuple?: []; params?: {} }
    'storefront.orderTracking': { paramsTuple?: []; params?: {} }
    'storefront.wishlist': { paramsTuple?: []; params?: {} }
    'storefront.cart': { paramsTuple?: []; params?: {} }
    'storefront.checkout': { paramsTuple?: []; params?: {} }
    'storefront.checkout.payment': { paramsTuple: [ParamValue]; params: {'orderId': ParamValue} }
    'storefront.checkout.confirmation': { paramsTuple: [ParamValue]; params: {'orderId': ParamValue} }
    'auth.social.redirect': { paramsTuple: [ParamValue]; params: {'provider': ParamValue} }
    'auth.social.callback': { paramsTuple: [ParamValue]; params: {'provider': ParamValue} }
    'storefront.account.login': { paramsTuple?: []; params?: {} }
    'storefront.account.register': { paramsTuple?: []; params?: {} }
    'storefront.account.forgotPassword': { paramsTuple?: []; params?: {} }
    'storefront.account.resetPassword': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'storefront.account.dashboard': { paramsTuple?: []; params?: {} }
    'storefront.account.orders': { paramsTuple?: []; params?: {} }
    'storefront.account.orders.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'storefront.account.reviews': { paramsTuple?: []; params?: {} }
    'storefront.account.profile': { paramsTuple?: []; params?: {} }
    'storefront.account.addresses': { paramsTuple?: []; params?: {} }
    'admin.auth.login': { paramsTuple?: []; params?: {} }
    'admin.auth.2fa': { paramsTuple?: []; params?: {} }
    'admin.auth.forgotPassword': { paramsTuple?: []; params?: {} }
    'admin.auth.resetPassword': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'admin.dashboard': { paramsTuple?: []; params?: {} }
    'admin.dashboard.alias': { paramsTuple?: []; params?: {} }
    'admin.analytics': { paramsTuple?: []; params?: {} }
    'admin.profile': { paramsTuple?: []; params?: {} }
    'admin.products.index': { paramsTuple?: []; params?: {} }
    'admin.products.importPage': { paramsTuple?: []; params?: {} }
    'admin.products.exportPage': { paramsTuple?: []; params?: {} }
    'admin.products.template': { paramsTuple?: []; params?: {} }
    'admin.products.create': { paramsTuple?: []; params?: {} }
    'admin.products.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.products.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.categories.index': { paramsTuple?: []; params?: {} }
    'admin.categories.create': { paramsTuple?: []; params?: {} }
    'admin.categories.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.orders.index': { paramsTuple?: []; params?: {} }
    'admin.orders.export': { paramsTuple?: []; params?: {} }
    'admin.orders.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.orders.invoice': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.draftOrders.index': { paramsTuple?: []; params?: {} }
    'admin.draftOrders.create': { paramsTuple?: []; params?: {} }
    'admin.draftOrders.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.giftCards.index': { paramsTuple?: []; params?: {} }
    'admin.giftCards.create': { paramsTuple?: []; params?: {} }
    'admin.giftCards.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.customers.index': { paramsTuple?: []; params?: {} }
    'admin.customers.create': { paramsTuple?: []; params?: {} }
    'admin.customers.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.customers.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.discounts.index': { paramsTuple?: []; params?: {} }
    'admin.discounts.create': { paramsTuple?: []; params?: {} }
    'admin.discounts.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.priceLists.index': { paramsTuple?: []; params?: {} }
    'admin.priceLists.create': { paramsTuple?: []; params?: {} }
    'admin.priceLists.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.inventory.index': { paramsTuple?: []; params?: {} }
    'admin.inventory.locations': { paramsTuple?: []; params?: {} }
    'admin.inventory.variant': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.index': { paramsTuple?: []; params?: {} }
    'admin.settings.taxes': { paramsTuple?: []; params?: {} }
    'admin.settings.currencies': { paramsTuple?: []; params?: {} }
    'admin.settings.locales': { paramsTuple?: []; params?: {} }
    'admin.settings.payments': { paramsTuple?: []; params?: {} }
    'admin.settings.shipping': { paramsTuple?: []; params?: {} }
    'admin.customizer.editor': { paramsTuple: [ParamValue,ParamValue?]; params: {'pageType': ParamValue,'pageId'?: ParamValue} }
    'admin.content.pages': { paramsTuple?: []; params?: {} }
    'admin.content.pages.create': { paramsTuple?: []; params?: {} }
    'admin.content.pages.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.content.menus': { paramsTuple?: []; params?: {} }
    'admin.content.banners': { paramsTuple?: []; params?: {} }
    'admin.blog.index': { paramsTuple?: []; params?: {} }
    'admin.blog.create': { paramsTuple?: []; params?: {} }
    'admin.blog.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.blog.categories': { paramsTuple?: []; params?: {} }
    'admin.reviews.index': { paramsTuple?: []; params?: {} }
    'admin.marketing.index': { paramsTuple?: []; params?: {} }
    'admin.marketing.abandonedCarts': { paramsTuple?: []; params?: {} }
    'admin.marketing.emailCampaigns': { paramsTuple?: []; params?: {} }
    'admin.settings.webhooks': { paramsTuple?: []; params?: {} }
    'admin.settings.webhooks.logs': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.users': { paramsTuple?: []; params?: {} }
    'admin.settings.roles': { paramsTuple?: []; params?: {} }
    'admin.settings.redirects': { paramsTuple?: []; params?: {} }
    'admin.settings.seo': { paramsTuple?: []; params?: {} }
    'admin.settings.store': { paramsTuple?: []; params?: {} }
    'admin.settings.attributes': { paramsTuple?: []; params?: {} }
    'admin.settings.regions': { paramsTuple?: []; params?: {} }
    'admin.settings.salesChannels': { paramsTuple?: []; params?: {} }
    'admin.settings.customerGroups': { paramsTuple?: []; params?: {} }
    'admin.settings.shippingProfiles': { paramsTuple?: []; params?: {} }
    'admin.settings.apiKeys': { paramsTuple?: []; params?: {} }
    'admin.settings.returnReasons': { paramsTuple?: []; params?: {} }
    'admin.settings.integrations': { paramsTuple?: []; params?: {} }
    'admin.settings.cache': { paramsTuple?: []; params?: {} }
    'admin.plugins.index': { paramsTuple?: []; params?: {} }
    'admin.plugins.settings': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.analytics.sales': { paramsTuple?: []; params?: {} }
    'admin.analytics.products': { paramsTuple?: []; params?: {} }
    'admin.analytics.customers': { paramsTuple?: []; params?: {} }
    'admin.collections': { paramsTuple?: []; params?: {} }
    'admin.collections.create': { paramsTuple?: []; params?: {} }
    'admin.collections.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.inventory.export': { paramsTuple?: []; params?: {} }
    'admin.inventory.importPage': { paramsTuple?: []; params?: {} }
    'admin.inventory.template': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'products.index': { paramsTuple?: []; params?: {} }
    'products.search': { paramsTuple?: []; params?: {} }
    'products.featured': { paramsTuple?: []; params?: {} }
    'products.new_arrivals': { paramsTuple?: []; params?: {} }
    'products.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'products.variants': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'products.related': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'categories.index': { paramsTuple?: []; params?: {} }
    'categories.tree': { paramsTuple?: []; params?: {} }
    'categories.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'categories.breadcrumb': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'cart.show': { paramsTuple?: []; params?: {} }
    'customers.me': { paramsTuple?: []; params?: {} }
    'customers.addresses': { paramsTuple?: []; params?: {} }
    'customers.wishlist': { paramsTuple?: []; params?: {} }
    'orders.track': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'orders.index': { paramsTuple?: []; params?: {} }
    'orders.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'digital_products.get_download_link': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'digital_products.get_customer_downloads': { paramsTuple: [ParamValue]; params: {'customerId': ParamValue} }
    'digital_products.suspend_license': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'digital_products.get_customer_licenses': { paramsTuple: [ParamValue]; params: {'customerId': ParamValue} }
    'subscriptions.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'subscriptions.get_customer_subscriptions': { paramsTuple: [ParamValue]; params: {'customerId': ParamValue} }
    'bundles.index': { paramsTuple?: []; params?: {} }
    'bundles.available': { paramsTuple?: []; params?: {} }
    'bundles.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'bundles.pricing': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'bundles.validate_stock': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'quantity': ParamValue} }
    'bundles.get_by_product': { paramsTuple: [ParamValue]; params: {'productId': ParamValue} }
    'images.get_image_urls': { paramsTuple?: []; params?: {} }
    'images.get_dimensions': { paramsTuple?: []; params?: {} }
    'images.get_metadata': { paramsTuple?: []; params?: {} }
    'health': { paramsTuple?: []; params?: {} }
    'seo.robots': { paramsTuple?: []; params?: {} }
    'seo.sitemap': { paramsTuple?: []; params?: {} }
    'seo.sitemapIndex': { paramsTuple?: []; params?: {} }
    'seo.webManifest': { paramsTuple?: []; params?: {} }
    'seo.organization': { paramsTuple?: []; params?: {} }
    'storefront.home': { paramsTuple?: []; params?: {} }
    'storefront.search': { paramsTuple?: []; params?: {} }
    'storefront.search.suggestions': { paramsTuple?: []; params?: {} }
    'storefront.about': { paramsTuple?: []; params?: {} }
    'storefront.contact': { paramsTuple?: []; params?: {} }
    'storefront.pages.show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'storefront.blog.index': { paramsTuple?: []; params?: {} }
    'storefront.blog.show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'storefront.shipping': { paramsTuple?: []; params?: {} }
    'storefront.returns': { paramsTuple?: []; params?: {} }
    'storefront.faq': { paramsTuple?: []; params?: {} }
    'storefront.privacy': { paramsTuple?: []; params?: {} }
    'storefront.terms': { paramsTuple?: []; params?: {} }
    'storefront.products.index': { paramsTuple?: []; params?: {} }
    'storefront.products.show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'storefront.category': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'storefront.collections': { paramsTuple?: []; params?: {} }
    'storefront.collections.show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'storefront.categories': { paramsTuple?: []; params?: {} }
    'storefront.compare': { paramsTuple?: []; params?: {} }
    'storefront.orderTracking': { paramsTuple?: []; params?: {} }
    'storefront.wishlist': { paramsTuple?: []; params?: {} }
    'storefront.cart': { paramsTuple?: []; params?: {} }
    'storefront.checkout': { paramsTuple?: []; params?: {} }
    'storefront.checkout.payment': { paramsTuple: [ParamValue]; params: {'orderId': ParamValue} }
    'storefront.checkout.confirmation': { paramsTuple: [ParamValue]; params: {'orderId': ParamValue} }
    'auth.social.redirect': { paramsTuple: [ParamValue]; params: {'provider': ParamValue} }
    'auth.social.callback': { paramsTuple: [ParamValue]; params: {'provider': ParamValue} }
    'storefront.account.login': { paramsTuple?: []; params?: {} }
    'storefront.account.register': { paramsTuple?: []; params?: {} }
    'storefront.account.forgotPassword': { paramsTuple?: []; params?: {} }
    'storefront.account.resetPassword': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'storefront.account.dashboard': { paramsTuple?: []; params?: {} }
    'storefront.account.orders': { paramsTuple?: []; params?: {} }
    'storefront.account.orders.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'storefront.account.reviews': { paramsTuple?: []; params?: {} }
    'storefront.account.profile': { paramsTuple?: []; params?: {} }
    'storefront.account.addresses': { paramsTuple?: []; params?: {} }
    'admin.auth.login': { paramsTuple?: []; params?: {} }
    'admin.auth.2fa': { paramsTuple?: []; params?: {} }
    'admin.auth.forgotPassword': { paramsTuple?: []; params?: {} }
    'admin.auth.resetPassword': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'admin.dashboard': { paramsTuple?: []; params?: {} }
    'admin.dashboard.alias': { paramsTuple?: []; params?: {} }
    'admin.analytics': { paramsTuple?: []; params?: {} }
    'admin.profile': { paramsTuple?: []; params?: {} }
    'admin.products.index': { paramsTuple?: []; params?: {} }
    'admin.products.importPage': { paramsTuple?: []; params?: {} }
    'admin.products.exportPage': { paramsTuple?: []; params?: {} }
    'admin.products.template': { paramsTuple?: []; params?: {} }
    'admin.products.create': { paramsTuple?: []; params?: {} }
    'admin.products.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.products.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.categories.index': { paramsTuple?: []; params?: {} }
    'admin.categories.create': { paramsTuple?: []; params?: {} }
    'admin.categories.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.orders.index': { paramsTuple?: []; params?: {} }
    'admin.orders.export': { paramsTuple?: []; params?: {} }
    'admin.orders.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.orders.invoice': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.draftOrders.index': { paramsTuple?: []; params?: {} }
    'admin.draftOrders.create': { paramsTuple?: []; params?: {} }
    'admin.draftOrders.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.giftCards.index': { paramsTuple?: []; params?: {} }
    'admin.giftCards.create': { paramsTuple?: []; params?: {} }
    'admin.giftCards.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.customers.index': { paramsTuple?: []; params?: {} }
    'admin.customers.create': { paramsTuple?: []; params?: {} }
    'admin.customers.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.customers.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.discounts.index': { paramsTuple?: []; params?: {} }
    'admin.discounts.create': { paramsTuple?: []; params?: {} }
    'admin.discounts.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.priceLists.index': { paramsTuple?: []; params?: {} }
    'admin.priceLists.create': { paramsTuple?: []; params?: {} }
    'admin.priceLists.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.inventory.index': { paramsTuple?: []; params?: {} }
    'admin.inventory.locations': { paramsTuple?: []; params?: {} }
    'admin.inventory.variant': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.index': { paramsTuple?: []; params?: {} }
    'admin.settings.taxes': { paramsTuple?: []; params?: {} }
    'admin.settings.currencies': { paramsTuple?: []; params?: {} }
    'admin.settings.locales': { paramsTuple?: []; params?: {} }
    'admin.settings.payments': { paramsTuple?: []; params?: {} }
    'admin.settings.shipping': { paramsTuple?: []; params?: {} }
    'admin.customizer.editor': { paramsTuple: [ParamValue,ParamValue?]; params: {'pageType': ParamValue,'pageId'?: ParamValue} }
    'admin.content.pages': { paramsTuple?: []; params?: {} }
    'admin.content.pages.create': { paramsTuple?: []; params?: {} }
    'admin.content.pages.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.content.menus': { paramsTuple?: []; params?: {} }
    'admin.content.banners': { paramsTuple?: []; params?: {} }
    'admin.blog.index': { paramsTuple?: []; params?: {} }
    'admin.blog.create': { paramsTuple?: []; params?: {} }
    'admin.blog.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.blog.categories': { paramsTuple?: []; params?: {} }
    'admin.reviews.index': { paramsTuple?: []; params?: {} }
    'admin.marketing.index': { paramsTuple?: []; params?: {} }
    'admin.marketing.abandonedCarts': { paramsTuple?: []; params?: {} }
    'admin.marketing.emailCampaigns': { paramsTuple?: []; params?: {} }
    'admin.settings.webhooks': { paramsTuple?: []; params?: {} }
    'admin.settings.webhooks.logs': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.users': { paramsTuple?: []; params?: {} }
    'admin.settings.roles': { paramsTuple?: []; params?: {} }
    'admin.settings.redirects': { paramsTuple?: []; params?: {} }
    'admin.settings.seo': { paramsTuple?: []; params?: {} }
    'admin.settings.store': { paramsTuple?: []; params?: {} }
    'admin.settings.attributes': { paramsTuple?: []; params?: {} }
    'admin.settings.regions': { paramsTuple?: []; params?: {} }
    'admin.settings.salesChannels': { paramsTuple?: []; params?: {} }
    'admin.settings.customerGroups': { paramsTuple?: []; params?: {} }
    'admin.settings.shippingProfiles': { paramsTuple?: []; params?: {} }
    'admin.settings.apiKeys': { paramsTuple?: []; params?: {} }
    'admin.settings.returnReasons': { paramsTuple?: []; params?: {} }
    'admin.settings.integrations': { paramsTuple?: []; params?: {} }
    'admin.settings.cache': { paramsTuple?: []; params?: {} }
    'admin.plugins.index': { paramsTuple?: []; params?: {} }
    'admin.plugins.settings': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.analytics.sales': { paramsTuple?: []; params?: {} }
    'admin.analytics.products': { paramsTuple?: []; params?: {} }
    'admin.analytics.customers': { paramsTuple?: []; params?: {} }
    'admin.collections': { paramsTuple?: []; params?: {} }
    'admin.collections.create': { paramsTuple?: []; params?: {} }
    'admin.collections.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.inventory.export': { paramsTuple?: []; params?: {} }
    'admin.inventory.importPage': { paramsTuple?: []; params?: {} }
    'admin.inventory.template': { paramsTuple?: []; params?: {} }
  }
  DELETE: {
    'cart.clear': { paramsTuple?: []; params?: {} }
    'cart.remove_item': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'cart.remove_discount': { paramsTuple?: []; params?: {} }
    'customers.delete_address': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'customers.remove_from_wishlist': { paramsTuple: [ParamValue]; params: {'productId': ParamValue} }
    'digital_products.revoke_download': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'subscriptions.remove_item': { paramsTuple: [ParamValue]; params: {'itemId': ParamValue} }
    'bundles.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'bundles.remove_item': { paramsTuple: [ParamValue]; params: {'itemId': ParamValue} }
    'storefront.wishlist.remove': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'storefront.cart.remove': { paramsTuple: [ParamValue]; params: {'itemId': ParamValue} }
    'storefront.cart.clear': { paramsTuple?: []; params?: {} }
    'storefront.cart.removeDiscount': { paramsTuple?: []; params?: {} }
    'storefront.account.addresses.delete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.products.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.categories.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.orders.fulfillments.cancel': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'fulfillmentId': ParamValue} }
    'admin.draftOrders.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.giftCards.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.customers.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.customers.addresses.delete': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'addressId': ParamValue} }
    'admin.discounts.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.priceLists.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.priceLists.prices.remove': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.taxes.classes.delete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.taxes.rates.delete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.content.pages.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.content.menus.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.content.menus.items.destroy': { paramsTuple: [ParamValue,ParamValue]; params: {'menuId': ParamValue,'itemId': ParamValue} }
    'admin.content.banners.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.blog.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.blog.categories.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.reviews.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.marketing.abandonedCarts.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.marketing.emailCampaigns.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.webhooks.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.users.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.roles.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.redirects.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.attributes.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.regions.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.regions.countries.remove': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'countryCode': ParamValue} }
    'admin.settings.salesChannels.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.salesChannels.products.remove': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.customerGroups.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.customerGroups.customers.remove': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.shippingProfiles.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.apiKeys.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.returnReasons.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.plugins.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.collections.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  POST: {
    'cart.add_item': { paramsTuple?: []; params?: {} }
    'cart.apply_discount': { paramsTuple?: []; params?: {} }
    'customers.register': { paramsTuple?: []; params?: {} }
    'customers.login': { paramsTuple?: []; params?: {} }
    'customers.logout': { paramsTuple?: []; params?: {} }
    'customers.add_address': { paramsTuple?: []; params?: {} }
    'customers.add_to_wishlist': { paramsTuple?: []; params?: {} }
    'orders.store': { paramsTuple?: []; params?: {} }
    'orders.cancel': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'digital_products.upload': { paramsTuple?: []; params?: {} }
    'digital_products.record_download': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'digital_products.validate_license': { paramsTuple?: []; params?: {} }
    'digital_products.activate_license': { paramsTuple?: []; params?: {} }
    'digital_products.deactivate_license': { paramsTuple?: []; params?: {} }
    'subscriptions.create': { paramsTuple?: []; params?: {} }
    'subscriptions.pause': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'subscriptions.resume': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'subscriptions.cancel': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'subscriptions.renew': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'subscriptions.add_item': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'subscriptions.stripe_webhook': { paramsTuple?: []; params?: {} }
    'bundles.create': { paramsTuple?: []; params?: {} }
    'bundles.duplicate': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'bundles.add_item': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'bundles.reorder_items': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'images.upload': { paramsTuple?: []; params?: {} }
    'images.batch_upload': { paramsTuple?: []; params?: {} }
    'images.optimize': { paramsTuple?: []; params?: {} }
    'images.convert_to_web_p': { paramsTuple?: []; params?: {} }
    'storefront.newsletter.subscribe': { paramsTuple?: []; params?: {} }
    'storefront.contact.submit': { paramsTuple?: []; params?: {} }
    'storefront.products.submitReview': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'storefront.wishlist.add': { paramsTuple?: []; params?: {} }
    'storefront.cart.add': { paramsTuple?: []; params?: {} }
    'storefront.cart.applyDiscount': { paramsTuple?: []; params?: {} }
    'storefront.checkout.process': { paramsTuple?: []; params?: {} }
    'storefront.checkout.processPayment': { paramsTuple: [ParamValue]; params: {'orderId': ParamValue} }
    'webhooks.stripe': { paramsTuple?: []; params?: {} }
    'webhooks.iyzico': { paramsTuple?: []; params?: {} }
    'storefront.account.login.post': { paramsTuple?: []; params?: {} }
    'storefront.account.register.post': { paramsTuple?: []; params?: {} }
    'storefront.account.logout': { paramsTuple?: []; params?: {} }
    'storefront.account.forgotPassword.post': { paramsTuple?: []; params?: {} }
    'storefront.account.resetPassword.post': { paramsTuple?: []; params?: {} }
    'storefront.account.addresses.add': { paramsTuple?: []; params?: {} }
    'admin.auth.login.post': { paramsTuple?: []; params?: {} }
    'admin.auth.2fa.verify': { paramsTuple?: []; params?: {} }
    'admin.auth.forgotPassword.post': { paramsTuple?: []; params?: {} }
    'admin.auth.resetPassword.post': { paramsTuple?: []; params?: {} }
    'admin.auth.logout': { paramsTuple?: []; params?: {} }
    'admin.profile.2fa.enable': { paramsTuple?: []; params?: {} }
    'admin.profile.2fa.confirm': { paramsTuple?: []; params?: {} }
    'admin.profile.2fa.disable': { paramsTuple?: []; params?: {} }
    'admin.products.import.process': { paramsTuple?: []; params?: {} }
    'admin.products.export.download': { paramsTuple?: []; params?: {} }
    'admin.products.store': { paramsTuple?: []; params?: {} }
    'admin.products.duplicate': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.products.bulk': { paramsTuple?: []; params?: {} }
    'admin.upload.images': { paramsTuple?: []; params?: {} }
    'admin.categories.store': { paramsTuple?: []; params?: {} }
    'admin.categories.reorder': { paramsTuple?: []; params?: {} }
    'admin.orders.cancel': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.orders.addNote': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.orders.fulfillments.create': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.orders.fulfillments.ship': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'fulfillmentId': ParamValue} }
    'admin.orders.fulfillments.deliver': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'fulfillmentId': ParamValue} }
    'admin.orders.refunds.create': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.orders.returns.create': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.orders.returns.receive': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'returnId': ParamValue} }
    'admin.orders.returns.cancel': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'returnId': ParamValue} }
    'admin.orders.returns.complete': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'returnId': ParamValue} }
    'admin.orders.claims.create': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.orders.exchanges.create': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.orders.edits.create': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.orders.edits.request': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'editId': ParamValue} }
    'admin.orders.edits.confirm': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'editId': ParamValue} }
    'admin.orders.edits.decline': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'editId': ParamValue} }
    'admin.draftOrders.store': { paramsTuple?: []; params?: {} }
    'admin.draftOrders.registerPayment': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.giftCards.store': { paramsTuple?: []; params?: {} }
    'admin.giftCards.adjust': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.giftCards.toggle': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.customers.store': { paramsTuple?: []; params?: {} }
    'admin.customers.addresses.add': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.discounts.store': { paramsTuple?: []; params?: {} }
    'admin.discounts.toggle': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.priceLists.store': { paramsTuple?: []; params?: {} }
    'admin.priceLists.prices.add': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.inventory.locations.create': { paramsTuple?: []; params?: {} }
    'admin.inventory.adjust': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.inventory.set': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.inventory.transfer': { paramsTuple?: []; params?: {} }
    'admin.inventory.bulk': { paramsTuple?: []; params?: {} }
    'admin.settings.taxes.classes.create': { paramsTuple?: []; params?: {} }
    'admin.settings.taxes.rates.create': { paramsTuple: [ParamValue]; params: {'classId': ParamValue} }
    'admin.settings.currencies.create': { paramsTuple?: []; params?: {} }
    'admin.settings.locales.create': { paramsTuple?: []; params?: {} }
    'admin.customizer.save': { paramsTuple: [ParamValue]; params: {'pageType': ParamValue} }
    'admin.ai.generate': { paramsTuple?: []; params?: {} }
    'admin.ai.imageToComponent': { paramsTuple?: []; params?: {} }
    'admin.content.pages.store': { paramsTuple?: []; params?: {} }
    'admin.content.menus.store': { paramsTuple?: []; params?: {} }
    'admin.content.menus.items.store': { paramsTuple: [ParamValue]; params: {'menuId': ParamValue} }
    'admin.content.banners.store': { paramsTuple?: []; params?: {} }
    'admin.blog.store': { paramsTuple?: []; params?: {} }
    'admin.blog.categories.store': { paramsTuple?: []; params?: {} }
    'admin.marketing.abandonedCarts.recover': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.marketing.emailCampaigns.store': { paramsTuple?: []; params?: {} }
    'admin.marketing.emailCampaigns.send': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.webhooks.create': { paramsTuple?: []; params?: {} }
    'admin.settings.webhooks.test': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.users.create': { paramsTuple?: []; params?: {} }
    'admin.settings.roles.create': { paramsTuple?: []; params?: {} }
    'admin.settings.redirects.create': { paramsTuple?: []; params?: {} }
    'admin.settings.attributes.create': { paramsTuple?: []; params?: {} }
    'admin.settings.regions.create': { paramsTuple?: []; params?: {} }
    'admin.settings.regions.countries.add': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.salesChannels.create': { paramsTuple?: []; params?: {} }
    'admin.settings.salesChannels.products.add': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.customerGroups.create': { paramsTuple?: []; params?: {} }
    'admin.settings.customerGroups.customers.add': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.shippingProfiles.create': { paramsTuple?: []; params?: {} }
    'admin.settings.apiKeys.create': { paramsTuple?: []; params?: {} }
    'admin.settings.apiKeys.revoke': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.returnReasons.create': { paramsTuple?: []; params?: {} }
    'admin.settings.cache.clear': { paramsTuple?: []; params?: {} }
    'admin.collections.store': { paramsTuple?: []; params?: {} }
    'admin.inventory.export.download': { paramsTuple?: []; params?: {} }
    'admin.inventory.import.process': { paramsTuple?: []; params?: {} }
  }
  PATCH: {
    'cart.update_item': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'customers.update': { paramsTuple?: []; params?: {} }
    'customers.update_address': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'subscriptions.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'subscriptions.update_item': { paramsTuple: [ParamValue]; params: {'itemId': ParamValue} }
    'bundles.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'bundles.update_item': { paramsTuple: [ParamValue]; params: {'itemId': ParamValue} }
    'storefront.cart.update': { paramsTuple: [ParamValue]; params: {'itemId': ParamValue} }
    'storefront.account.profile.update': { paramsTuple?: []; params?: {} }
    'storefront.account.password.update': { paramsTuple?: []; params?: {} }
    'storefront.account.addresses.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.profile.update': { paramsTuple?: []; params?: {} }
    'admin.profile.password': { paramsTuple?: []; params?: {} }
    'admin.products.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.categories.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.orders.updateStatus': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.orders.claims.update': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'claimId': ParamValue} }
    'admin.orders.exchanges.update': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'exchangeId': ParamValue} }
    'admin.draftOrders.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.giftCards.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.customers.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.customers.updateStatus': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.customers.updatePassword': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.customers.addresses.update': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'addressId': ParamValue} }
    'admin.discounts.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.priceLists.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.priceLists.rules': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.inventory.locations.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.general': { paramsTuple?: []; params?: {} }
    'admin.settings.update': { paramsTuple?: []; params?: {} }
    'admin.settings.taxes.classes.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.taxes.rates.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.currencies.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.locales.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.ai': { paramsTuple?: []; params?: {} }
    'admin.content.pages.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.content.menus.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.content.menus.items.update': { paramsTuple: [ParamValue,ParamValue]; params: {'menuId': ParamValue,'itemId': ParamValue} }
    'admin.content.banners.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.blog.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.blog.categories.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.reviews.updateStatus': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.webhooks.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.users.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.roles.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.redirects.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.seo.update': { paramsTuple?: []; params?: {} }
    'admin.settings.store.update': { paramsTuple?: []; params?: {} }
    'admin.settings.attributes.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.regions.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.salesChannels.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.customerGroups.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.shippingProfiles.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.returnReasons.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.settings.payments.provider': { paramsTuple?: []; params?: {} }
    'admin.settings.shipping.method': { paramsTuple?: []; params?: {} }
    'admin.plugins.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.collections.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}