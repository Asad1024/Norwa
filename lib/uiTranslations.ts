import { Language } from '@/store/languageStore'

export interface UITranslations {
  common: {
    loading: string
    saving: string
    cancel: string
    confirm: string
    ok: string
    close: string
    delete: string
    edit: string
    save: string
    back: string
    next: string
    previous: string
    search: string
    filter: string
    all: string
    yes: string
    no: string
    remove: string
    add: string
    update: string
    create: string
    submit: string
    continue: string
    proceed: string
    view: string
    select: string
    required: string
    optional: string
    total: string
    subtotal: string
    price: string
    quantity: string
    items: string
    item: string
    moreItems: string
    description: string
    name: string
    email: string
    password: string
    phone: string
    address: string
    shipping: string
    free: string
    each: string
    default: string
    setDefault: string
  }
  navbar: {
    products: string
    about: string
    howToUse: string
    contact: string
    login: string
    signUp: string
    profile: string
    orders: string
    admin: string
    signOut: string
    cart: string
  }
  home: {
    welcome: string
    tagline: string
    shopNow: string
    featuredProducts: string
    featuredSubtitle: string
    noProducts: string
    checkBackSoon: string
    viewAllProducts: string
    ecoFriendly: string
    ecoFriendlyDesc: string
    effective: string
    effectiveDesc: string
    safe: string
    safeDesc: string
    bannerSubtitle: string
    bannerDescription: string
    advantagesTitle: string
    advantagesSubtitle: string
    advantageWaterBased: string
    advantageWaterBasedDesc: string
    advantageHumanFriendly: string
    advantageHumanFriendlyDesc: string
    advantageNorwegianWater: string
    advantageNorwegianWaterDesc: string
    advantageEffective: string
    advantageEffectiveDesc: string
    advantageLowConsumption: string
    advantageLowConsumptionDesc: string
    advantageDegradable: string
    advantageDegradableDesc: string
    greenexTitle: string
    greenexDescription: string
    productRangeTitle: string
    productRangeSubtitle: string
    productRangeDescription: string
  }
  products: {
    title: string
    subtitle: string
    searchPlaceholder: string
    productsFound: string
    productFound: string
    noProductsFound: string
    tryAdjusting: string
    viewDetails: string
    stock: string
    outOfStock: string
  }
  productDetail: {
    description: string
    addToCart: string
    adding: string
    addedToCart: string
    outOfStock: string
  }
    cart: {
      title: string
      emptyTitle: string
      emptyMessage: string
      startShopping: string
      whyShop: string
      ecoFriendly: string
      ecoFriendlyDesc: string
      fastDelivery: string
      fastDeliveryDesc: string
      qualityProducts: string
      qualityProductsDesc: string
      cartItems: string
      remove: string
      removedFromCart: string
      orderSummary: string
      items: string
      maxStockReached: string
    proceedToCheckout: string
    continueShopping: string
  }
  checkout: {
    title: string
    shippingInfo: string
    selectAddress: string
    newAddress: string
    saveAddress: string
    addressLabel: string
    shippingAddress: string
    phoneNumber: string
    addressRequired: string
    phoneRequired: string
    phoneInvalid: string
    placeOrder: string
    placingOrder: string
    orderPlaced: string
    orderFailed: string
    backToCart: string
    viewOrders: string
  }
  login: {
    title: string
    welcome: string
    email: string
    password: string
    login: string
    noAccount: string
    signUp: string
    failed: string
    forgotPassword: string
    resetPassword: string
    resetPasswordSent: string
    resetPasswordError: string
    backToLogin: string
    accountDeactivated: string
  }
  register: {
    title: string
    createAccount: string
    name: string
    email: string
    password: string
    confirmPassword: string
    register: string
    haveAccount: string
    login: string
    passwordsDontMatch: string
    failed: string
  }
  profile: {
    title: string
    email: string
    role: string
    admin: string
    user: string
    changePassword: string
    currentPassword: string
    newPassword: string
    confirmPassword: string
    passwordUpdated: string
    passwordError: string
  }
  orders: {
    title: string
    noOrders: string
    orderId: string
    date: string
    status: string
    total: string
    viewDetails: string
    pending: string
    processing: string
    delivered: string
    cancelled: string
  }
  admin: {
    dashboard: string
    dashboardSubtitle: string
    products: string
    categories: string
    orders: string
    users: string
    stats: {
      totalProducts: string
      totalOrders: string
      totalCategories: string
      pendingOrders: string
    }
    recentOrders: string
    allUsers: string
    manageProducts: string
    addNewProduct: string
    manageCategories: string
    addNewCategory: string
      allOrders: string
      quickActions: string
      created: string
      lastSignIn: string
      noUsersFound: string
      never: string
      status: string
      actions: string
      makeAdmin: string
      removeAdmin: string
      activate: string
      deactivate: string
      active: string
      inactive: string
      changeRoleConfirm: string
      changeRoleMessage: string
      activateConfirm: string
      activateMessage: string
      deactivateConfirm: string
      deactivateMessage: string
      roleUpdated: string
      statusUpdated: string
      updateError: string
      deleteUser: string
      deleteUserMessage: string
      userDeleted: string
      deleteError: string
      navLinksManagement: string
      navLinksDescription: string
      navLinksUpdated: string
      noNavLinksFound: string
      manageNavbarPages: string
    }
    adminPages: {
      title: string
      subtitle: string
      editPage: string
      editDescription: string
      titleLabel: string
      titlePlaceholder: string
      subtitleLabel: string
      subtitlePlaceholder: string
      contentLabel: string
      contentPlaceholder: string
      contentHint: string
      contentUpdated: string
      noPages: string
      pageNotFound: string
      translatedToNO: string
      showInNavigation: string
      navLinkEnabled: string
      navLinkDisabled: string
      navLinkNotConfigured: string
    }
  adminProducts: {
    title: string
    addNew: string
    noProducts: string
    image: string
    assignUsers: string
    assignUsersDescription: string
    assignmentsUpdated: string
    adminAlwaysSee: string
    name: string
    description: string
    price: string
    category: string
    actions: string
    edit: string
    delete: string
  }
  adminCategories: {
    title: string
    addNew: string
    noCategories: string
    name: string
    description: string
    icon: string
    active: string
    inactive: string
    status: string
    sortOrder: string
    actions: string
    edit: string
    delete: string
    deleteConfirm: string
    deleteMessage: string
    deleted: string
    deleteFailed: string
  }
  adminOrders: {
    title: string
    searchPlaceholder: string
    pending: string
    processing: string
    delivered: string
    cancelled: string
    noOrders: string
    updateStatus: string
    updating: string
    updateFailed: string
  }
  forms: {
    productName: string
    productDescription: string
    categoryName: string
    categoryDescription: string
    price: string
    stock: string
    stockDescription: string
    image: string
    uploadImage: string
    imageUrl: string
    or: string
    english: string
    norwegian: string
    englishRequired: string
    norwegianOptional: string
    autoFillMessage: string
    translateToNO: string
    translating: string
  }
  modal: {
    ok: string
    cancel: string
  }
  toast: {
    success: string
    error: string
    info: string
  }
  loader: {
    loading: string
    saving: string
    uploading: string
    creating: string
    updating: string
    deleting: string
    loadingCart: string
    loadingDashboard: string
    checkingAccess: string
    signingOut: string
  }
  footer: {
    copyright: string
    tagline: string
  }
  notFound: {
    title: string
    message: string
    goHome: string
  }
  about: {
    tagline: string
    aboutTitle: string
    aboutDescription1: string
    aboutDescription2: string
    aboutDescription3: string
    aboutDescription4: string
    electrochemicallyActivated: string
    innovativeTechnology: string
    ourMission: string
    missionSubtitle: string
    growthInnovation: string
    growthDescription: string
    norwaCleaningRange: string
    norwaDescription: string
    ourVision: string
    visionDescription: string
    ourCoreValues: string
    valuesSubtitle: string
    sustainability: string
    sustainabilityDesc: string
    innovation: string
    innovationDesc: string
    reliability: string
    reliabilityDesc: string
  }
  contact: {
    title: string
    subtitle: string
    visitUs: string
    companyName: string
    address: string
    emailLabel: string
    corporateWebsite: string
    findUsOnMap: string
    sendUsMessage: string
    nameLabel: string
    namePlaceholder: string
    emailPlaceholder: string
    subjectLabel: string
    subjectPlaceholder: string
    messageLabel: string
    messagePlaceholder: string
    sendMessage: string
    thankYou: string
    thankYouMessage: string
    otherProducts: string
    otherProductsDesc: string
    visitWebsite: string
  }
  howToUse: {
    title: string
    subtitle: string
    gettingStarted: string
    gettingStartedDesc: string
    introVideoTitle: string
    introVideoDesc: string
    quickStartTitle: string
    quickStartDesc: string
    fettfjerner: string
    fettfjernerDesc: string
    fettfjernerDemoTitle: string
    fettfjernerDemoDesc: string
    fettfjernerUsageTitle: string
    fettfjernerUsageDesc: string
    grillRenser: string
    grillRenserDesc: string
  }
}

const translations: Record<Language, UITranslations> = {
  en: {
    common: {
      loading: 'Loading...',
      saving: 'Saving...',
      cancel: 'Cancel',
      confirm: 'Confirm',
      ok: 'OK',
      close: 'Close',
      delete: 'Delete',
      edit: 'Edit',
      save: 'Save',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      search: 'Search',
      filter: 'Filter',
      all: 'All',
      yes: 'Yes',
      no: 'No',
      remove: 'Remove',
      add: 'Add',
      update: 'Update',
      create: 'Create',
      submit: 'Submit',
      continue: 'Continue',
      proceed: 'Proceed',
      view: 'View',
      select: 'Select',
      required: 'Required',
      optional: 'Optional',
      total: 'Total',
      subtotal: 'Subtotal',
      price: 'Price',
      quantity: 'Quantity',
      items: 'items',
      item: 'item',
      moreItems: 'more items',
      description: 'Description',
      name: 'Name',
      email: 'Email',
      password: 'Password',
      phone: 'Phone',
      address: 'Address',
      shipping: 'Shipping',
      free: 'Free',
      each: 'each',
      default: 'Default',
      setDefault: 'Set Default',
    },
    navbar: {
      products: 'Products',
      about: 'About',
      howToUse: 'How to use NORWA Products',
      contact: 'Contact',
      login: 'Login',
      signUp: 'Sign Up',
      profile: 'Profile',
      orders: 'Orders',
      admin: 'Admin',
      signOut: 'Sign Out',
      cart: 'Shopping Cart',
    },
    home: {
      welcome: 'Welcome to Norwa',
      tagline: 'Discover sustainable, nature-friendly products for a greener future',
      shopNow: 'Shop Now',
      featuredProducts: 'Featured Products',
      featuredSubtitle: 'Our most popular nature-friendly solutions',
      noProducts: 'No products available yet. Check back soon!',
      checkBackSoon: 'Check back soon!',
      viewAllProducts: 'View All Products',
      ecoFriendly: 'Eco-Friendly',
      ecoFriendlyDesc: 'Biodegradable formulas that respect nature',
      effective: 'Effective',
      effectiveDesc: 'Powerful cleaning without harsh chemicals',
      safe: 'Safe',
      safeDesc: 'Safe for your family and the environment',
      bannerSubtitle: 'Water Based Cleaning and Care Products Range',
      bannerDescription: 'NORWA is a Norwegian brand of cleaning and care products that are produced using electrolyzed water.',
      advantagesTitle: 'Advantages of NORWA Products',
      advantagesSubtitle: 'Discover what makes our products unique',
      advantageWaterBased: 'Water Based Products',
      advantageWaterBasedDesc: '90-95% electrolyzed water',
      advantageHumanFriendly: 'Human & Environment Friendly',
      advantageHumanFriendlyDesc: 'Safe formulation for people and nature',
      advantageNorwegianWater: 'High-Quality Norwegian Water',
      advantageNorwegianWaterDesc: 'Made using premium Norwegian Water',
      advantageEffective: 'Effective Cleaning Solution',
      advantageEffectiveDesc: 'Powerful cleaning performance',
      advantageLowConsumption: 'Low Consumption',
      advantageLowConsumptionDesc: 'Efficient use compared to similar products',
      advantageDegradable: 'Easily Degradable',
      advantageDegradableDesc: 'Environmentally responsible disposal',
      greenexTitle: 'Greenex',
      greenexDescription: 'Greenex is a Norwegian technology company that promotes environmentally friendly and ecologically preferable technologies, materials, and equipment. Our goal is to connect these technologies with the right users, encouraging the use of sustainable products and services.',
      productRangeTitle: 'NORWA Cleaning and Care Product Range',
      productRangeSubtitle: 'Comprehensive solutions for every sector',
      productRangeDescription: 'Greenex offers various cleaning and hygiene products for different sectors such as household, industrial, pet and veterinary, and auto industry. We provide a range of products that cater to the specific needs of each sector.',
    },
    products: {
      title: 'Our Products',
      subtitle: 'Discover nature-friendly solutions for every cleaning need',
      searchPlaceholder: 'Search products...',
      productsFound: 'products found',
      productFound: 'product found',
      noProductsFound: 'No products found',
      tryAdjusting: 'Try adjusting your search or filter criteria',
      viewDetails: 'View Details',
      stock: 'Stock',
      outOfStock: 'Out of Stock',
    },
    productDetail: {
      description: 'Description',
      addToCart: 'Add to Cart',
      adding: 'Adding...',
      addedToCart: 'added to cart!',
      outOfStock: 'Out of Stock',
    },
    cart: {
      title: 'Shopping Cart',
      emptyTitle: 'Your Cart is Empty',
      emptyMessage: "Looks like you haven't added anything to your cart yet. Start exploring our nature-friendly products and add them to your cart!",
      startShopping: 'Start Shopping',
      whyShop: 'Why Shop with Norwa?',
      ecoFriendly: 'Eco-Friendly',
      ecoFriendlyDesc: 'Biodegradable and nature-friendly products that respect our planet',
      fastDelivery: 'Fast Delivery',
      fastDeliveryDesc: 'Quick and reliable shipping to get your products when you need them',
      qualityProducts: 'Quality Products',
      qualityProductsDesc: 'Premium quality guaranteed with sustainable ingredients',
      cartItems: 'Cart Items',
      remove: 'Remove',
      removedFromCart: 'removed from cart',
      orderSummary: 'Order Summary',
      items: 'Items',
      maxStockReached: 'Maximum stock available reached',
      proceedToCheckout: 'Proceed to Checkout',
      continueShopping: 'Continue Shopping',
    },
    checkout: {
      title: 'Checkout',
      shippingInfo: 'Shipping Information',
      selectAddress: 'Select Address',
      newAddress: 'New Address',
      saveAddress: 'Save this address for future orders',
      addressLabel: 'Address Label',
      shippingAddress: 'Shipping Address',
      phoneNumber: 'Phone Number',
      addressRequired: 'Shipping address is required',
      phoneRequired: 'Phone number is required',
      phoneInvalid: 'Please enter a valid phone number',
      placeOrder: 'Place Order',
      placingOrder: 'Placing order...',
      orderPlaced: 'Order placed successfully!',
      orderFailed: 'Failed to place order',
      backToCart: 'Back to Cart',
      viewOrders: 'View Orders',
    },
    login: {
      title: 'Login',
      welcome: 'Welcome back to Norwa',
      email: 'Email',
      password: 'Password',
      login: 'Login',
      noAccount: "Don't have an account?",
      signUp: 'Sign up',
      failed: 'Failed to login',
      forgotPassword: 'Forgot Password?',
      resetPassword: 'Reset Password',
      resetPasswordSent: 'Password reset email sent! Check your inbox.',
      resetPasswordError: 'Failed to send reset email',
      backToLogin: 'Back to Login',
      accountDeactivated: 'Your account is currently deactivated. Please contact an administrator for assistance.',
    },
    register: {
      title: 'Register',
      createAccount: 'Create your account',
      name: 'Name',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      register: 'Register',
      haveAccount: 'Already have an account?',
      login: 'Login',
      passwordsDontMatch: 'Passwords do not match',
      failed: 'Failed to register',
    },
    profile: {
      title: 'Profile',
      email: 'Email',
      role: 'Role',
      admin: 'Admin',
      user: 'User',
      changePassword: 'Change Password',
      currentPassword: 'Current Password',
      newPassword: 'New Password',
      confirmPassword: 'Confirm New Password',
      passwordUpdated: 'Password updated successfully!',
      passwordError: 'Failed to update password',
    },
    orders: {
      title: 'My Orders',
      noOrders: 'No orders yet',
      orderId: 'Order ID',
      date: 'Date',
      status: 'Status',
      total: 'Total',
      viewDetails: 'View Details',
      pending: 'Pending',
      processing: 'Processing',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
    },
    admin: {
      dashboard: 'Admin Dashboard',
      dashboardSubtitle: 'Overview and quick actions',
      products: 'Products',
      categories: 'Categories',
      orders: 'Orders',
      users: 'Users',
      stats: {
        totalProducts: 'Total Products',
        totalOrders: 'Total Orders',
        totalCategories: 'Total Categories',
        pendingOrders: 'Pending Orders',
      },
      recentOrders: 'Recent Orders',
      allUsers: 'All Users',
      manageProducts: 'Manage Products',
      addNewProduct: 'Add New Product',
      manageCategories: 'Manage Categories',
      addNewCategory: 'Add New Category',
      allOrders: 'All Orders',
      quickActions: 'Quick Actions',
      created: 'Created',
      lastSignIn: 'Last Sign In',
      noUsersFound: 'No users found',
      never: 'Never',
      status: 'Status',
      actions: 'Actions',
      makeAdmin: 'Make Admin',
      removeAdmin: 'Remove Admin',
      activate: 'Activate',
      deactivate: 'Deactivate',
      active: 'Active',
      inactive: 'Inactive',
      changeRoleConfirm: 'Change User Role',
      changeRoleMessage: 'Are you sure you want to change this user\'s role?',
      activateConfirm: 'Activate User',
      activateMessage: 'Are you sure you want to activate this user?',
      deactivateConfirm: 'Deactivate User',
      deactivateMessage: 'Are you sure you want to deactivate this user?',
      roleUpdated: 'User role updated successfully',
      statusUpdated: 'User status updated successfully',
      updateError: 'Failed to update user',
      deleteUser: 'Delete User',
      deleteUserMessage: 'Are you sure you want to permanently delete this user? This will delete all their orders, addresses, and cart items. This action cannot be undone.',
      userDeleted: 'User and all related data deleted successfully',
      deleteError: 'Failed to delete user',
      navLinksManagement: 'Navigation Links',
      navLinksDescription: 'Enable or disable navigation links. Disabled links will not appear in the navigation menu.',
      navLinksUpdated: 'Navigation links updated successfully',
      noNavLinksFound: 'No navigation links found',
      manageNavbarPages: 'Manage Navbar Pages',
    },
    adminPages: {
      title: 'Manage Pages',
      subtitle: 'Edit content for About, Contact, and How to Use pages',
      editPage: 'Edit Page',
      editDescription: 'Update the content for this page',
      titleLabel: 'Title',
      titlePlaceholder: 'Page title',
      subtitleLabel: 'Subtitle',
      subtitlePlaceholder: 'Page subtitle (optional)',
      contentLabel: 'Content (JSON)',
      contentPlaceholder: 'Enter JSON content...',
      contentHint: 'Content must be valid JSON format',
      contentUpdated: 'Page content updated successfully',
      noPages: 'No pages found',
      pageNotFound: 'Page not found',
      translatedToNO: 'Content translated to Norwegian',
      showInNavigation: 'Show in Navigation',
      navLinkEnabled: 'Page is now visible in navigation',
      navLinkDisabled: 'Page is now hidden from navigation',
      navLinkNotConfigured: 'Navigation link not configured',
    },
    adminProducts: {
      title: 'Manage Products',
      addNew: 'Add New Product',
      noProducts: 'No products found',
      image: 'Image',
      name: 'Name',
      description: 'Description',
      price: 'Price',
      category: 'Category',
      actions: 'Actions',
      edit: 'Edit',
      delete: 'Delete',
      assignUsers: 'Assign Users',
      adminAlwaysSee: 'Admin always see this product',
      assignUsersDescription: 'Select which users can see this product. If no users are selected, the product will be visible to all users.',
      assignmentsUpdated: 'Product assignments updated successfully',
      adminAlwaysSee: 'Admin always see this product',
    },
    adminCategories: {
      title: 'Manage Categories',
      addNew: 'Add New Category',
      noCategories: 'No categories found',
      name: 'Name',
      description: 'Description',
      icon: 'Icon',
      active: 'Active',
      inactive: 'Inactive',
      status: 'Status',
      sortOrder: 'Sort Order',
      actions: 'Actions',
      edit: 'Edit',
      delete: 'Delete',
      deleteConfirm: 'Delete Category',
      deleteMessage: 'Are you sure you want to delete this category? This action cannot be undone.',
      deleted: 'Category deleted successfully',
      deleteFailed: 'Failed to delete category',
    },
    adminOrders: {
      title: 'All Orders',
      searchPlaceholder: 'Search orders by ID, address, phone...',
      pending: 'Pending Orders',
      processing: 'Processing Orders',
      delivered: 'Delivered Orders',
      cancelled: 'Cancelled Orders',
      noOrders: 'No orders found',
      updateStatus: 'Update order status',
      updating: 'Updating order status...',
      updateFailed: 'Failed to update order status',
    },
    forms: {
      productName: 'Product Name',
      productDescription: 'Description',
      categoryName: 'Category Name',
      categoryDescription: 'Description',
      price: 'Price ($)',
      stock: 'Stock',
      stockDescription: 'Number of items available in stock',
      image: 'Product Image',
      uploadImage: 'Upload an image (max 5MB) or use URL below',
      imageUrl: 'Enter image URL or leave empty for default icon',
      or: 'OR',
      english: 'English',
      norwegian: 'Norwegian',
      englishRequired: '(required)',
      norwegianOptional: '(optional)',
      autoFillMessage: 'Optional: If left empty, English text will be used',
      translateToNO: 'Translate from English',
      translating: 'Translating...',
    },
    modal: {
      ok: 'OK',
      cancel: 'Cancel',
    },
    toast: {
      success: 'Success',
      error: 'Error',
      info: 'Info',
    },
    loader: {
      loading: 'Loading...',
      saving: 'Saving...',
      uploading: 'Uploading...',
      creating: 'Creating...',
      updating: 'Updating...',
      deleting: 'Deleting...',
      loadingCart: 'Loading cart...',
      loadingDashboard: 'Loading dashboard...',
      checkingAccess: 'Checking access...',
      signingOut: 'Signing out...',
    },
    footer: {
      copyright: '© 2024 Norwa. All rights reserved.',
      tagline: 'Building a greener future together.',
    },
    notFound: {
      title: '404 - Page Not Found',
      message: "The page you're looking for doesn't exist.",
      goHome: 'Go Home',
    },
    about: {
      tagline: 'Changing Lives with Innovation',
      aboutTitle: 'About Greenex',
      aboutDescription1: 'Greenex is a Norwegian manufacturing and product development company. We develop and manufacture the most environmentally and ecologically preferable technologies, materials, and equipment with efficiency and reliability.',
      aboutDescription2: 'Our main business activity is to produce and sell products based on electrochemically activated water.',
      aboutDescription3: 'We produce two basic solutions: Greenolyte, the world\'s most powerful disinfectant, and Greetholyte, a nonfoaming detergent.',
      aboutDescription4: 'Greenex consists of a dedicated and experienced team of professionals who provide an efficient and reliable service to our customers.',
      electrochemicallyActivated: 'Electrochemically Activated Water',
      innovativeTechnology: 'Innovative technology for sustainable solutions',
      ourMission: 'Our Mission',
      missionSubtitle: 'Solving future challenges through innovation and sustainable technology',
      growthInnovation: 'Growth & Innovation',
      growthDescription: 'A fast-growing company promoting environment-friendly solutions. In the spring of 2020, we successfully introduced the Greenolyte brand to customers in Norway and other European countries, providing us with a strong platform for reinforcing the growth and development of our business.',
      norwaCleaningRange: 'NORWA Cleaning Range',
      norwaDescription: 'In 2023, we introduced the NORWA cleaning range to our customers, expanding our commitment to providing nature-friendly cleaning solutions for everyday use.',
      ourVision: 'Our Vision',
      visionDescription: 'Our mission is to solve future challenges by connecting people, knowledge, and unique technology to create better, greener, and safer solutions – while still running a profitable business for our customers and us.',
      ourCoreValues: 'Our Core Values',
      valuesSubtitle: 'What drives us forward',
      sustainability: 'Sustainability',
      sustainabilityDesc: 'Committed to environmentally responsible practices and products',
      innovation: 'Innovation',
      innovationDesc: 'Pioneering new technologies for better solutions',
      reliability: 'Reliability',
      reliabilityDesc: 'Delivering consistent quality and dependable service',
    },
    contact: {
      title: 'Contact Us',
      subtitle: 'Get in touch with Greenex Norway',
      visitUs: 'Visit Us',
      companyName: 'Greenex Norway',
      address: 'Industriveien 31\n1337 Sandvika, Norway',
      emailLabel: 'Email',
      corporateWebsite: 'Corporate Website',
      findUsOnMap: 'Find Us on Map',
      sendUsMessage: 'Send us a Message',
      nameLabel: 'Name',
      namePlaceholder: 'Your name',
      emailPlaceholder: 'your@email.com',
      subjectLabel: 'Subject',
      subjectPlaceholder: 'Subject',
      messageLabel: 'Message',
      messagePlaceholder: 'Your message...',
      sendMessage: 'Send Message',
      thankYou: 'Thank you for your message!',
      thankYouMessage: "We'll get back to you soon.",
      otherProducts: 'Other Products & Services',
      otherProductsDesc: 'For information about our full range of products and corporate services, please visit our corporate website.',
      visitWebsite: 'Visit greenolyte.no',
    },
    howToUse: {
      title: 'How to Use NORWA Products',
      subtitle: 'NORWA products are very effective and easy to use. Below are videos and methods about the use of products.',
      gettingStarted: 'Getting Started',
      gettingStartedDesc: 'These introductory videos will help you understand the basics and get started with NORWA products.',
      introVideoTitle: 'Introduction to NORWA Products',
      introVideoDesc: 'Learn about the benefits and features of our nature-friendly cleaning solutions',
      quickStartTitle: 'Quick Start Guide',
      quickStartDesc: 'Get started quickly with our step-by-step tutorial',
      fettfjerner: 'NORWA Fettfjerner',
      fettfjernerDesc: 'Video presentation about the effectiveness of the product and how to use it.',
      fettfjernerDemoTitle: 'Fettfjerner Effectiveness Demo',
      fettfjernerDemoDesc: 'See how NORWA Fettfjerner removes tough grease and fat stains',
      fettfjernerUsageTitle: 'How to Use Fettfjerner',
      fettfjernerUsageDesc: 'Step-by-step guide on proper application and usage techniques',
      grillRenser: 'NORWA Grill Renser',
      grillRenserDesc: 'Video presentation about the effectiveness of the product and how to use it.',
    },
  },
  no: {
    common: {
      loading: 'Laster...',
      saving: 'Lagrer...',
      cancel: 'Avbryt',
      confirm: 'Bekreft',
      ok: 'OK',
      close: 'Lukk',
      delete: 'Slett',
      edit: 'Rediger',
      save: 'Lagre',
      back: 'Tilbake',
      next: 'Neste',
      previous: 'Forrige',
      search: 'Søk',
      filter: 'Filter',
      all: 'Alle',
      yes: 'Ja',
      no: 'Nei',
      remove: 'Fjern',
      add: 'Legg til',
      update: 'Oppdater',
      create: 'Opprett',
      submit: 'Send',
      continue: 'Fortsett',
      proceed: 'Fortsett',
      view: 'Vis',
      select: 'Velg',
      required: 'Påkrevd',
      optional: 'Valgfritt',
      total: 'Totalt',
      subtotal: 'Delsum',
      price: 'Pris',
      quantity: 'Antall',
      items: 'varer',
      item: 'vare',
      moreItems: 'flere varer',
      description: 'Beskrivelse',
      name: 'Navn',
      email: 'E-post',
      password: 'Passord',
      phone: 'Telefon',
      address: 'Adresse',
      shipping: 'Frakt',
      free: 'Gratis',
      each: 'stk',
      default: 'Standard',
      setDefault: 'Sett som standard',
    },
    navbar: {
      products: 'Produkter',
      about: 'Om oss',
      howToUse: 'Hvordan bruke NORWA-produkter',
      contact: 'Kontakt',
      login: 'Logg inn',
      signUp: 'Registrer deg',
      profile: 'Profil',
      orders: 'Bestillinger',
      admin: 'Administrator',
      signOut: 'Logg ut',
      cart: 'Handlekurv',
    },
    home: {
      welcome: 'Velkommen til Norwa',
      tagline: 'Oppdag bærekraftige, naturvennlige produkter for en grønnere fremtid',
      shopNow: 'Handle nå',
      featuredProducts: 'Utvalgte produkter',
      featuredSubtitle: 'Våre mest populære naturvennlige løsninger',
      noProducts: 'Ingen produkter tilgjengelig ennå. Sjekk tilbake snart!',
      checkBackSoon: 'Sjekk tilbake snart!',
      viewAllProducts: 'Se alle produkter',
      ecoFriendly: 'Miljøvennlig',
      ecoFriendlyDesc: 'Biologisk nedbrytbare formler som respekterer naturen',
      effective: 'Effektiv',
      effectiveDesc: 'Kraftig rengjøring uten skarpe kjemikalier',
      safe: 'Trygg',
      safeDesc: 'Trygg for familien din og miljøet',
      bannerSubtitle: 'Vannbasert rengjørings- og pleieprodukter',
      bannerDescription: 'NORWA er et norsk merke av rengjørings- og pleieprodukter som produseres ved hjelp av elektrolyseert vann.',
      advantagesTitle: 'Fordeler med NORWA-produkter',
      advantagesSubtitle: 'Oppdag hva som gjør produktene våre unike',
      advantageWaterBased: 'Vannbaserte produkter',
      advantageWaterBasedDesc: '90-95% elektrolyseert vann',
      advantageHumanFriendly: 'Menneskelig og miljøvennlig',
      advantageHumanFriendlyDesc: 'Trygg formulering for mennesker og natur',
      advantageNorwegianWater: 'Høy kvalitet norsk vann',
      advantageNorwegianWaterDesc: 'Laget med premium norsk vann',
      advantageEffective: 'Effektiv rengjøringsløsning',
      advantageEffectiveDesc: 'Kraftig rengjøringsprestasjon',
      advantageLowConsumption: 'Lavt forbruk',
      advantageLowConsumptionDesc: 'Effektiv bruk sammenlignet med lignende produkter',
      advantageDegradable: 'Lett nedbrytbar',
      advantageDegradableDesc: 'Miljøansvarlig avfallshåndtering',
      greenexTitle: 'Greenex',
      greenexDescription: 'Greenex er et norsk teknologiselskap som fremmer miljøvennlige og økologisk foretrukne teknologier, materialer og utstyr. Vårt mål er å koble disse teknologiene med riktige brukere, og oppmuntre til bruk av bærekraftige produkter og tjenester.',
      productRangeTitle: 'NORWA rengjørings- og pleieprodukter',
      productRangeSubtitle: 'Omfattende løsninger for alle sektorer',
      productRangeDescription: 'Greenex tilbyr ulike rengjørings- og hygiene produkter for forskjellige sektorer som husholdning, industri, kjæledyr og veterinær, og bilindustri. Vi tilbyr et utvalg av produkter som tilfredsstiller de spesifikke behovene til hver sektor.',
    },
    products: {
      title: 'Våre produkter',
      subtitle: 'Oppdag naturvennlige løsninger for alle rengjøringsbehov',
      searchPlaceholder: 'Søk produkter...',
      productsFound: 'produkter funnet',
      productFound: 'produkt funnet',
      noProductsFound: 'Ingen produkter funnet',
      tryAdjusting: 'Prøv å justere søket eller filterkriteriene',
      viewDetails: 'Vis detaljer',
      stock: 'Lager',
      outOfStock: 'Utsolgt',
    },
    productDetail: {
      description: 'Beskrivelse',
      addToCart: 'Legg i handlekurv',
      adding: 'Legger til...',
      addedToCart: 'lagt i handlekurv!',
      outOfStock: 'Utsolgt',
    },
    cart: {
      title: 'Handlekurv',
      emptyTitle: 'Handlekurven din er tom',
      emptyMessage: 'Det ser ut til at du ikke har lagt til noe i handlekurven ennå. Begynn å utforske våre naturvennlige produkter og legg dem til i handlekurven!',
      startShopping: 'Begynn å handle',
      whyShop: 'Hvorfor handle hos Norwa?',
      ecoFriendly: 'Miljøvennlig',
      ecoFriendlyDesc: 'Biologisk nedbrytbare og naturvennlige produkter som respekterer planeten vår',
      fastDelivery: 'Rask levering',
      fastDeliveryDesc: 'Rask og pålitelig levering for å få produktene dine når du trenger dem',
      qualityProducts: 'Kvalitetsprodukter',
      qualityProductsDesc: 'Premium kvalitet garantert med bærekraftige ingredienser',
      cartItems: 'Handlekurvvarer',
      remove: 'Fjern',
      removedFromCart: 'fjernet fra handlekurv',
      orderSummary: 'Ordreoversikt',
      items: 'Varer',
      maxStockReached: 'Maksimalt lager tilgjengelig nådd',
      proceedToCheckout: 'Fortsett til kassen',
      continueShopping: 'Fortsett å handle',
    },
    checkout: {
      title: 'Kasse',
      shippingInfo: 'Leveringsinformasjon',
      selectAddress: 'Velg adresse',
      newAddress: 'Ny adresse',
      saveAddress: 'Lagre denne adressen for fremtidige bestillinger',
      addressLabel: 'Adresseetikett',
      shippingAddress: 'Leveringsadresse',
      phoneNumber: 'Telefonnummer',
      addressRequired: 'Leveringsadresse er påkrevd',
      phoneRequired: 'Telefonnummer er påkrevd',
      phoneInvalid: 'Vennligst oppgi et gyldig telefonnummer',
      placeOrder: 'Legg inn bestilling',
      placingOrder: 'Legger inn bestilling...',
      orderPlaced: 'Bestilling lagt inn!',
      orderFailed: 'Kunne ikke legge inn bestilling',
      backToCart: 'Tilbake til handlekurv',
      viewOrders: 'Vis bestillinger',
    },
    login: {
      title: 'Logg inn',
      welcome: 'Velkommen tilbake til Norwa',
      email: 'E-post',
      password: 'Passord',
      login: 'Logg inn',
      noAccount: 'Har du ikke en konto?',
      signUp: 'Registrer deg',
      failed: 'Kunne ikke logge inn',
      forgotPassword: 'Glemt passord?',
      resetPassword: 'Tilbakestill passord',
      resetPasswordSent: 'E-post for tilbakestilling av passord sendt! Sjekk innboksen din.',
      resetPasswordError: 'Kunne ikke sende tilbakestillings-e-post',
      backToLogin: 'Tilbake til innlogging',
      accountDeactivated: 'Din konto er for øyeblikket deaktivert. Vennligst kontakt en administrator for hjelp.',
    },
    register: {
      title: 'Registrer',
      createAccount: 'Opprett din konto',
      name: 'Navn',
      email: 'E-post',
      password: 'Passord',
      confirmPassword: 'Bekreft passord',
      register: 'Registrer',
      haveAccount: 'Har du allerede en konto?',
      login: 'Logg inn',
      passwordsDontMatch: 'Passordene stemmer ikke overens',
      failed: 'Kunne ikke registrere',
    },
    profile: {
      title: 'Profil',
      email: 'E-post',
      role: 'Rolle',
      admin: 'Administrator',
      user: 'Bruker',
      changePassword: 'Endre passord',
      currentPassword: 'Nåværende passord',
      newPassword: 'Nytt passord',
      confirmPassword: 'Bekreft nytt passord',
      passwordUpdated: 'Passord oppdatert!',
      passwordError: 'Kunne ikke oppdatere passord',
    },
    orders: {
      title: 'Mine bestillinger',
      noOrders: 'Ingen bestillinger ennå',
      orderId: 'Bestillings-ID',
      date: 'Dato',
      status: 'Status',
      total: 'Totalt',
      viewDetails: 'Vis detaljer',
      pending: 'Venter',
      processing: 'Behandles',
      delivered: 'Levert',
      cancelled: 'Kansellert',
    },
    admin: {
      dashboard: 'Administrasjonspanel',
      dashboardSubtitle: 'Oversikt og hurtighandlinger',
      products: 'Produkter',
      categories: 'Kategorier',
      orders: 'Bestillinger',
      users: 'Brukere',
      stats: {
        totalProducts: 'Totalt antall produkter',
        totalOrders: 'Totalt antall bestillinger',
        totalCategories: 'Totalt antall kategorier',
        pendingOrders: 'Ventende bestillinger',
      },
      recentOrders: 'Siste bestillinger',
      allUsers: 'Alle brukere',
      manageProducts: 'Administrer produkter',
      addNewProduct: 'Legg til nytt produkt',
      manageCategories: 'Administrer kategorier',
      addNewCategory: 'Legg til ny kategori',
      allOrders: 'Alle bestillinger',
      quickActions: 'Hurtighandlinger',
      created: 'Opprettet',
      lastSignIn: 'Siste innlogging',
      noUsersFound: 'Ingen brukere funnet',
      never: 'Aldri',
      status: 'Status',
      actions: 'Handlinger',
      makeAdmin: 'Gjør til administrator',
      removeAdmin: 'Fjern administrator',
      activate: 'Aktiver',
      deactivate: 'Deaktiver',
      active: 'Aktiv',
      inactive: 'Inaktiv',
      changeRoleConfirm: 'Endre brukerrolle',
      changeRoleMessage: 'Er du sikker på at du vil endre denne brukerens rolle?',
      activateConfirm: 'Aktiver bruker',
      activateMessage: 'Er du sikker på at du vil aktivere denne brukeren?',
      deactivateConfirm: 'Deaktiver bruker',
      deactivateMessage: 'Er du sikker på at du vil deaktivere denne brukeren?',
      roleUpdated: 'Brukerrolle oppdatert',
      statusUpdated: 'Brukerstatus oppdatert',
      updateError: 'Kunne ikke oppdatere bruker',
      deleteUser: 'Slett bruker',
      deleteUserMessage: 'Er du sikker på at du vil slette denne brukeren permanent? Dette vil slette alle deres bestillinger, adresser og handlekurvvarer. Denne handlingen kan ikke angres.',
      userDeleted: 'Bruker og all relatert data slettet',
      deleteError: 'Kunne ikke slette bruker',
      navLinksManagement: 'Navigasjonslenker',
      navLinksDescription: 'Aktiver eller deaktiver navigasjonslenker. Deaktiverte lenker vil ikke vises i navigasjonsmenyen.',
      navLinksUpdated: 'Navigasjonslenker oppdatert',
      noNavLinksFound: 'Ingen navigasjonslenker funnet',
      manageNavbarPages: 'Administrer navigasjonssider',
    },
    adminPages: {
      title: 'Administrer sider',
      subtitle: 'Rediger innhold for Om oss, Kontakt og Hvordan bruke-sider',
      editPage: 'Rediger side',
      editDescription: 'Oppdater innholdet for denne siden',
      titleLabel: 'Tittel',
      titlePlaceholder: 'Sidetittel',
      subtitleLabel: 'Undertittel',
      subtitlePlaceholder: 'Sideundertittel (valgfritt)',
      contentLabel: 'Innhold (JSON)',
      contentPlaceholder: 'Skriv inn JSON-innhold...',
      contentHint: 'Innholdet må være i gyldig JSON-format',
      contentUpdated: 'Sideinnhold oppdatert',
      noPages: 'Ingen sider funnet',
      pageNotFound: 'Side ikke funnet',
      translatedToNO: 'Innhold oversatt til norsk',
      showInNavigation: 'Vis i navigasjon',
      navLinkEnabled: 'Siden er nå synlig i navigasjonen',
      navLinkDisabled: 'Siden er nå skjult fra navigasjonen',
      navLinkNotConfigured: 'Navigasjonslenke ikke konfigurert',
    },
    adminProducts: {
      title: 'Administrer produkter',
      addNew: 'Legg til nytt produkt',
      noProducts: 'Ingen produkter funnet',
      image: 'Bilde',
      name: 'Navn',
      description: 'Beskrivelse',
      price: 'Pris',
      category: 'Kategori',
      actions: 'Handlinger',
      edit: 'Rediger',
      delete: 'Slett',
      assignUsers: 'Tildel brukere',
      adminAlwaysSee: 'Administrator ser alltid dette produktet',
      assignUsersDescription: 'Velg hvilke brukere som kan se dette produktet. Hvis ingen brukere er valgt, vil produktet være synlig for alle brukere.',
      assignmentsUpdated: 'Produkttildelinger oppdatert',
      adminAlwaysSee: 'Administrator ser alltid dette produktet',
    },
    adminCategories: {
      title: 'Administrer kategorier',
      addNew: 'Legg til ny kategori',
      noCategories: 'Ingen kategorier funnet',
      name: 'Navn',
      description: 'Beskrivelse',
      icon: 'Ikon',
      active: 'Aktiv',
      inactive: 'Inaktiv',
      status: 'Status',
      sortOrder: 'Sorteringsrekkefølge',
      actions: 'Handlinger',
      edit: 'Rediger',
      delete: 'Slett',
      deleteConfirm: 'Slett kategori',
      deleteMessage: 'Er du sikker på at du vil slette denne kategorien? Denne handlingen kan ikke angres.',
      deleted: 'Kategori slettet',
      deleteFailed: 'Kunne ikke slette kategori',
    },
    adminOrders: {
      title: 'Alle bestillinger',
      searchPlaceholder: 'Søk bestillinger etter ID, adresse, telefon...',
      pending: 'Ventende bestillinger',
      processing: 'Bestillinger under behandling',
      delivered: 'Leverte bestillinger',
      cancelled: 'Kansellerte bestillinger',
      noOrders: 'Ingen bestillinger funnet',
      updateStatus: 'Oppdater bestillingsstatus',
      updating: 'Oppdaterer bestillingsstatus...',
      updateFailed: 'Kunne ikke oppdatere bestillingsstatus',
    },
    forms: {
      productName: 'Produktnavn',
      productDescription: 'Beskrivelse',
      categoryName: 'Kategorinavn',
      categoryDescription: 'Beskrivelse',
      price: 'Pris ($)',
      stock: 'Lager',
      stockDescription: 'Antall varer tilgjengelig på lager',
      image: 'Produktbilde',
      uploadImage: 'Last opp et bilde (maks 5MB) eller bruk URL nedenfor',
      imageUrl: 'Skriv inn bilde-URL eller la stå tomt for standardikon',
      or: 'ELLER',
      english: 'Engelsk',
      norwegian: 'Norsk',
      englishRequired: '(påkrevd)',
      norwegianOptional: '(valgfritt)',
      autoFillMessage: 'Valgfritt: Hvis den står tom, vil engelsk tekst brukes',
      translateToNO: 'Oversett fra engelsk',
      translating: 'Oversetter...',
    },
    modal: {
      ok: 'OK',
      cancel: 'Avbryt',
    },
    toast: {
      success: 'Suksess',
      error: 'Feil',
      info: 'Info',
    },
    loader: {
      loading: 'Laster...',
      saving: 'Lagrer...',
      uploading: 'Laster opp...',
      creating: 'Oppretter...',
      updating: 'Oppdaterer...',
      deleting: 'Sletter...',
      loadingCart: 'Laster handlekurv...',
      loadingDashboard: 'Laster dashboard...',
      checkingAccess: 'Sjekker tilgang...',
      signingOut: 'Logger ut...',
    },
    footer: {
      copyright: '© 2024 Norwa. Alle rettigheter forbeholdt.',
      tagline: 'Bygger en grønnere fremtid sammen.',
    },
    notFound: {
      title: '404 - Side ikke funnet',
      message: 'Siden du leter etter finnes ikke.',
      goHome: 'Gå hjem',
    },
    about: {
      tagline: 'Endrer liv med innovasjon',
      aboutTitle: 'Om Greenex',
      aboutDescription1: 'Greenex er et norsk produksjons- og produktutviklingsselskap. Vi utvikler og produserer de mest miljø- og økologisk foretrukne teknologiene, materialene og utstyret med effektivitet og pålitelighet.',
      aboutDescription2: 'Vår hovedforretningsaktivitet er å produsere og selge produkter basert på elektrokjemisk aktivert vann.',
      aboutDescription3: 'Vi produserer to grunnleggende løsninger: Greenolyte, verdens kraftigste desinfeksjonsmiddel, og Greetholyte, et skumfritt vaskemiddel.',
      aboutDescription4: 'Greenex består av et dedikert og erfarne team av fagfolk som gir en effektiv og pålitelig tjeneste til våre kunder.',
      electrochemicallyActivated: 'Elektrokjemisk aktivert vann',
      innovativeTechnology: 'Innovativ teknologi for bærekraftige løsninger',
      ourMission: 'Vår misjon',
      missionSubtitle: 'Løse fremtidens utfordringer gjennom innovasjon og bærekraftig teknologi',
      growthInnovation: 'Vekst og innovasjon',
      growthDescription: 'Et raskt voksende selskap som fremmer miljøvennlige løsninger. Våren 2020 introduserte vi med hell Greenolyte-merket til kunder i Norge og andre europeiske land, noe som ga oss en sterk plattform for å forsterke veksten og utviklingen av vår virksomhet.',
      norwaCleaningRange: 'NORWA Rengjøringsserie',
      norwaDescription: 'I 2023 introduserte vi NORWA-rengjøringsserien til våre kunder, og utvidet vårt engasjement for å tilby naturvennlige rengjøringsløsninger til daglig bruk.',
      ourVision: 'Vår visjon',
      visionDescription: 'Vår misjon er å løse fremtidens utfordringer ved å koble mennesker, kunnskap og unik teknologi for å skape bedre, grønnere og tryggere løsninger – samtidig som vi driver en lønnsom virksomhet for våre kunder og oss.',
      ourCoreValues: 'Våre kjerneverdier',
      valuesSubtitle: 'Det som driver oss fremover',
      sustainability: 'Bærekraft',
      sustainabilityDesc: 'Forpliktet til miljøansvarlig praksis og produkter',
      innovation: 'Innovasjon',
      innovationDesc: 'Banebrytende nye teknologier for bedre løsninger',
      reliability: 'Pålitelighet',
      reliabilityDesc: 'Leverer konsekvent kvalitet og pålitelig service',
    },
    contact: {
      title: 'Kontakt oss',
      subtitle: 'Ta kontakt med Greenex Norway',
      visitUs: 'Besøk oss',
      companyName: 'Greenex Norway',
      address: 'Industriveien 31\n1337 Sandvika, Norge',
      emailLabel: 'E-post',
      corporateWebsite: 'Bedriftsnettsted',
      findUsOnMap: 'Finn oss på kartet',
      sendUsMessage: 'Send oss en melding',
      nameLabel: 'Navn',
      namePlaceholder: 'Ditt navn',
      emailPlaceholder: 'din@epost.no',
      subjectLabel: 'Emne',
      subjectPlaceholder: 'Emne',
      messageLabel: 'Melding',
      messagePlaceholder: 'Din melding...',
      sendMessage: 'Send melding',
      thankYou: 'Takk for din melding!',
      thankYouMessage: 'Vi kommer tilbake til deg snart.',
      otherProducts: 'Andre produkter og tjenester',
      otherProductsDesc: 'For informasjon om vårt fulle utvalg av produkter og bedriftstjenester, vennligst besøk vårt bedriftsnettsted.',
      visitWebsite: 'Besøk greenolyte.no',
    },
    howToUse: {
      title: 'Hvordan bruke NORWA-produkter',
      subtitle: 'Lær hvordan du bruker våre produkter effektivt med våre omfattende videoguider',
      gettingStarted: 'Komme i gang',
      gettingStartedDesc: 'Disse innledende videoene vil hjelpe deg med å forstå det grunnleggende og komme i gang med NORWA-produkter.',
      introVideoTitle: 'Introduksjon til NORWA-produkter',
      introVideoDesc: 'Lær om fordelene og funksjonene til våre naturvennlige rengjøringsløsninger',
      quickStartTitle: 'Hurtigstartguide',
      quickStartDesc: 'Kom i gang raskt med vår trinn-for-trinn-opplæring',
      fettfjerner: 'NORWA Fettfjerner',
      fettfjernerDesc: 'Videopresentasjon om produktets effektivitet og hvordan du bruker det.',
      fettfjernerDemoTitle: 'Fettfjerner-effektivitetsdemo',
      fettfjernerDemoDesc: 'Se hvordan NORWA Fettfjerner fjerner hardnakket smør og fettflekker',
      fettfjernerUsageTitle: 'Hvordan bruke Fettfjerner',
      fettfjernerUsageDesc: 'Trinn-for-trinn-guide om riktig påføring og bruksteknikker',
      grillRenser: 'NORWA Grill Renser',
      grillRenserDesc: 'Videopresentasjon om produktets effektivitet og hvordan du bruker det.',
    },
  },
}

export const getUITranslation = (lang: Language): UITranslations => {
  return translations[lang]
}
