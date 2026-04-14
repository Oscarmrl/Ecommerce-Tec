import "dotenv/config";
import { PrismaClient, OrderStatus, PaymentStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { hash } from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Iniciando seed de base de datos...");

  console.log("🧹 Limpiando datos existentes...");
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.review.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();
  console.log("✅ Datos limpiados");

  console.log("👤 Creando usuarios...");
  const hashedPassword = await hash("password123", 10);

  const adminUser = await prisma.user.create({
    data: {
      email: "admin@test.com",
      name: "Administrador",
      password: hashedPassword,
      role: "ADMIN",
    },
  });
  const testUser = await prisma.user.create({
    data: {
      email: "user@test.com",
      name: "Usuario de Prueba",
      password: hashedPassword,
      role: "USER",
    },
  });
  console.log(`✅ Usuarios creados: ${adminUser.email}, ${testUser.email}`);

  console.log("📂 Creando categorías...");
  const categoriesData = [
    {
      name: "Laptops",
      slug: "laptops",
      description: "Computadoras portátiles de última generación",
      icon: "💻",
    },
    {
      name: "Smartphones",
      slug: "smartphones",
      description: "Teléfonos inteligentes con tecnología avanzada",
      icon: "📱",
    },
    {
      name: "Accesorios",
      slug: "accesorios",
      description: "Accesorios y periféricos para tus dispositivos",
      icon: "🎧",
    },
    {
      name: "Componentes",
      slug: "componentes",
      description: "Componentes de hardware para PC",
      icon: "⚙️",
    },
  ];

  const createdCategories = [];
  for (const c of categoriesData) {
    createdCategories.push(await prisma.category.create({ data: c }));
  }
  console.log(`✅ ${createdCategories.length} categorías creadas`);

  // ─────────────────────────────────────────────────────────────
  // IMÁGENES: URLs directas de Unsplash por ID
  // No requieren API key, no tienen límite de requests.
  // Formato: https://images.unsplash.com/photo-{ID}?w=800&q=80
  // ─────────────────────────────────────────────────────────────
  console.log("📦 Creando productos...");

  const products = [
    {
      name: 'MacBook Pro 16" M3 Max',
      slug: "macbook-pro-16-m3-max",
      description:
        "La laptop profesional definitiva con chip M3 Max, pantalla Liquid Retina XDR y hasta 40 núcleos de GPU.",
      shortDescription: "Potencia extrema para profesionales creativos",
      price: 3299.99,
      comparePrice: 3599.99,
      images: [
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80",
        "https://images.unsplash.com/photo-1611186871525-426e3a3ece12?w=800&q=80",
      ],
      categoryId: createdCategories[0].id,
      featured: true,
      inventory: 15,
      rating: 4.8,
      tags: ["apple", "macbook", "pro", "m3", "laptop"],
      brand: "Apple",
      processor: "Apple M3 Max",
      ram: "64GB",
      storage: "2TB SSD",
      graphics: "40-core GPU",
      display: '16.2" Liquid Retina XDR',
      os: "macOS Sonoma",
      weight: "2.2 kg",
      battery: "100Wh",
    },
    {
      name: "iPhone 15 Pro Max",
      slug: "iphone-15-pro-max",
      description:
        "El iPhone más avanzado con Dynamic Island, cámara de 48MP y chip A17 Pro.",
      shortDescription: "Potencia y fotografía profesional en tu bolsillo",
      price: 1299.99,
      comparePrice: 1399.99,
      images: [
        "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&q=80",
        "https://images.unsplash.com/photo-1512054502232-10a0a035d672?w=800&q=80",
      ],
      categoryId: createdCategories[1].id,
      featured: true,
      inventory: 25,
      rating: 4.7,
      tags: ["apple", "iphone", "pro", "smartphone"],
      brand: "Apple",
      processor: "A17 Pro",
      ram: "8GB",
      storage: "256GB",
      display: '6.7" Super Retina XDR',
      battery: "4422 mAh",
    },
    {
      name: "Dell XPS 15",
      slug: "dell-xps-15",
      description:
        "Laptop premium con pantalla InfinityEdge, procesadores Intel Core i9 y diseño ultradelgado.",
      shortDescription: "Diseño elegante y potencia para creadores",
      price: 1999.99,
      comparePrice: 2199.99,
      images: [
        "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=80",
        "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&q=80",
      ],
      categoryId: createdCategories[0].id,
      featured: true,
      inventory: 12,
      rating: 4.6,
      tags: ["dell", "xps", "laptop", "windows"],
      brand: "Dell",
      processor: "Intel Core i9-13900H",
      ram: "32GB",
      storage: "1TB SSD",
      graphics: "NVIDIA RTX 4060",
      display: '15.6" 3.5K OLED',
      os: "Windows 11 Pro",
      weight: "1.8 kg",
      battery: "86Wh",
    },
    {
      name: "Samsung Galaxy S24 Ultra",
      slug: "samsung-galaxy-s24-ultra",
      description:
        "Smartphone con S Pen integrado, cámara de 200MP e inteligencia artificial avanzada.",
      shortDescription: "Productividad y creatividad sin límites",
      price: 1199.99,
      comparePrice: 1299.99,
      images: [
        "https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=800&q=80",
        "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&q=80",
      ],
      categoryId: createdCategories[1].id,
      featured: false,
      inventory: 18,
      rating: 4.5,
      tags: ["samsung", "galaxy", "android", "smartphone"],
      brand: "Samsung",
      processor: "Snapdragon 8 Gen 3",
      ram: "12GB",
      storage: "512GB",
      display: '6.8" Dynamic AMOLED 2X',
      battery: "5000 mAh",
    },
    {
      name: "AirPods Pro (2da generación)",
      slug: "airpods-pro-2",
      description:
        "Audífonos inalámbricos con cancelación activa de ruido y sonido adaptativo.",
      shortDescription: "Sonido inmersivo con cancelación de ruido",
      price: 249.99,
      comparePrice: 279.99,
      images: [
        "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&q=80",
        "https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=800&q=80",
      ],
      categoryId: createdCategories[2].id,
      featured: true,
      inventory: 40,
      rating: 4.8,
      tags: ["apple", "airpods", "audio", "wireless"],
      brand: "Apple",
    },
    {
      name: "NVIDIA RTX 4090",
      slug: "nvidia-rtx-4090",
      description:
        "Tarjeta gráfica flagship con arquitectura Ada Lovelace y 24GB GDDR6X.",
      shortDescription: "La GPU más potente para gaming y creación",
      price: 1599.99,
      comparePrice: 1799.99,
      images: [
        "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&q=80",
        "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&q=80",
      ],
      categoryId: createdCategories[3].id,
      featured: true,
      inventory: 8,
      rating: 4.9,
      tags: ["nvidia", "gpu", "graphics", "gaming"],
      brand: "NVIDIA",
    },
    {
      name: "Logitech MX Master 3S",
      slug: "logitech-mx-master-3s",
      description:
        "Mouse ergonómico para productividad con sensor Darkfield de 8000 DPI.",
      shortDescription: "Precisión y confort para trabajo intensivo",
      price: 99.99,
      comparePrice: 119.99,
      images: [
        "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80",
        "https://images.unsplash.com/photo-1563297007-0686b7003af7?w=800&q=80",
      ],
      categoryId: createdCategories[2].id,
      featured: false,
      inventory: 35,
      rating: 4.7,
      tags: ["logitech", "mouse", "wireless", "productivity"],
      brand: "Logitech",
    },
    {
      name: "Samsung Odyssey G9",
      slug: "samsung-odyssey-g9",
      description:
        'Monitor curvo 49" con resolución 5120x1440, 240Hz y HDR1000.',
      shortDescription: "Inmersión total en gaming y multitarea",
      price: 1299.99,
      comparePrice: 1499.99,
      images: [
        "https://images.unsplash.com/photo-1616763355548-1b606f439f86?w=800&q=80",
        "https://images.unsplash.com/photo-1547119957-637f8679db1e?w=800&q=80",
      ],
      categoryId: createdCategories[3].id,
      featured: true,
      inventory: 10,
      rating: 4.6,
      tags: ["samsung", "monitor", "gaming", "curved"],
      brand: "Samsung",
      display: '49" DQHD (5120x1440)',
    },
    {
      name: 'iPad Pro 12.9" M2',
      slug: "ipad-pro-12-9-m2",
      description:
        "Tablet profesional con chip M2, pantalla Liquid Retina XDR y compatibilidad con Apple Pencil.",
      shortDescription: "Creatividad sin límites en movimiento",
      price: 1099.99,
      comparePrice: 1199.99,
      images: [
        "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80",
        "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&q=80",
      ],
      categoryId: createdCategories[0].id,
      featured: false,
      inventory: 20,
      rating: 4.7,
      tags: ["apple", "ipad", "tablet", "pro"],
      brand: "Apple",
      processor: "Apple M2",
      ram: "8GB",
      storage: "256GB",
      display: '12.9" Liquid Retina XDR',
      battery: "40.88 Wh",
    },
    {
      name: "PlayStation 5",
      slug: "playstation-5",
      description:
        "Consola de videojuegos de última generación con SSD ultra rápido y ray tracing.",
      shortDescription: "La nueva era del gaming",
      price: 499.99,
      comparePrice: 549.99,
      images: [
        "https://images.unsplash.com/photo-1607853202273-232359939dc2?w=800&q=80",
        "https://images.unsplash.com/photo-1622297845775-5ff3fef71d13?w=800&q=80",
      ],
      categoryId: createdCategories[2].id,
      featured: true,
      inventory: 15,
      rating: 4.8,
      tags: ["sony", "playstation", "gaming", "console"],
      brand: "Sony",
    },
    {
      name: "AMD Ryzen 9 7950X",
      slug: "amd-ryzen-9-7950x",
      description:
        "Procesador de 16 núcleos y 32 hilos con arquitectura Zen 4 y frecuencia boost de 5.7GHz.",
      shortDescription: "Máximo rendimiento para creadores",
      price: 699.99,
      comparePrice: 799.99,
      images: [
        "https://images.unsplash.com/photo-1555617766-2ea6e9c2d87d?w=800&q=80",
        "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
      ],
      categoryId: createdCategories[3].id,
      featured: false,
      inventory: 25,
      rating: 4.9,
      tags: ["amd", "cpu", "processor", "gaming"],
      brand: "AMD",
    },
    {
      name: "Apple Watch Ultra 2",
      slug: "apple-watch-ultra-2",
      description:
        "Reloj inteligente para aventuras extremas con GPS de doble banda y autonomía de 36 horas.",
      shortDescription: "Aventura y tecnología en tu muñeca",
      price: 799.99,
      comparePrice: 849.99,
      images: [
        "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80",
        "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&q=80",
      ],
      categoryId: createdCategories[2].id,
      featured: true,
      inventory: 22,
      rating: 4.6,
      tags: ["apple", "watch", "wearable", "fitness"],
      brand: "Apple",
    },
    {
      name: "Razer Blade 15",
      slug: "razer-blade-15",
      description:
        "Laptop gaming con pantalla QHD 240Hz, procesadores Intel i9 y GPU NVIDIA RTX 4070.",
      shortDescription: "Potencia gaming en formato ultraportátil",
      price: 2499.99,
      comparePrice: 2699.99,
      images: [
        "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80",
        "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&q=80",
      ],
      categoryId: createdCategories[0].id,
      featured: false,
      inventory: 9,
      rating: 4.5,
      tags: ["razer", "gaming", "laptop", "windows"],
      brand: "Razer",
      processor: "Intel Core i9-13950HX",
      ram: "32GB",
      storage: "1TB SSD",
      graphics: "NVIDIA RTX 4070",
      display: '15.6" QHD 240Hz',
      os: "Windows 11",
      weight: "2.0 kg",
      battery: "80Wh",
    },
    {
      name: "Google Pixel 8 Pro",
      slug: "google-pixel-8-pro",
      description:
        "Smartphone con Tensor G3, cámara de 50MP y 7 años de actualizaciones de software.",
      shortDescription: "Inteligencia artificial y fotografía premium",
      price: 999.99,
      comparePrice: 1099.99,
      images: [
        "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&q=80",
        "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=800&q=80",
      ],
      categoryId: createdCategories[1].id,
      featured: false,
      inventory: 17,
      rating: 4.6,
      tags: ["google", "pixel", "android", "smartphone"],
      brand: "Google",
      processor: "Google Tensor G3",
      ram: "12GB",
      storage: "256GB",
      display: '6.7" LTPO OLED',
      battery: "5050 mAh",
    },
    {
      name: "Corsair Vengeance RGB 32GB",
      slug: "corsair-vengeance-rgb-32gb",
      description:
        "Kit de memoria DDR5 6000MHz CL36 con iluminación RGB personalizable.",
      shortDescription: "Rendimiento y estilo para tu PC",
      price: 149.99,
      comparePrice: 179.99,
      images: [
        "https://images.unsplash.com/photo-1562976540-1502c2145851?w=800&q=80",
        "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&q=80",
      ],
      categoryId: createdCategories[3].id,
      featured: false,
      inventory: 45,
      rating: 4.7,
      tags: ["corsair", "ram", "memory", "rgb"],
      brand: "Corsair",
      ram: "32GB (2x16GB)",
    },
  ];

  const createdProducts = [];
  for (const productData of products) {
    createdProducts.push(await prisma.product.create({ data: productData }));
  }
  console.log(`✅ ${createdProducts.length} productos creados`);

  // Variantes
  console.log("🎨 Creando variantes de productos...");
  const iphone = createdProducts.find((p) => p.slug.includes("iphone-15"));
  if (iphone) {
    for (const v of [
      {
        name: "Color",
        value: "Titanio Negro",
        price: 0,
        inventory: 10,
        sku: "IP15PM-BLK",
      },
      {
        name: "Color",
        value: "Titanio Blanco",
        price: 0,
        inventory: 8,
        sku: "IP15PM-WHT",
      },
      {
        name: "Color",
        value: "Titanio Azul",
        price: 0,
        inventory: 7,
        sku: "IP15PM-BLU",
      },
    ])
      await prisma.productVariant.create({
        data: { ...v, productId: iphone.id },
      });
  }

  const macbook = createdProducts.find((p) => p.slug.includes("macbook-pro"));
  if (macbook) {
    for (const v of [
      {
        name: "Almacenamiento",
        value: "1TB SSD",
        price: -200,
        inventory: 8,
        sku: "MBP16-1TB",
      },
      {
        name: "Almacenamiento",
        value: "2TB SSD",
        price: 0,
        inventory: 5,
        sku: "MBP16-2TB",
      },
      {
        name: "Almacenamiento",
        value: "4TB SSD",
        price: 600,
        inventory: 2,
        sku: "MBP16-4TB",
      },
    ])
      await prisma.productVariant.create({
        data: { ...v, productId: macbook.id },
      });
  }

  const airpods = createdProducts.find((p) => p.slug.includes("airpods-pro"));
  if (airpods) {
    for (const v of [
      {
        name: "Edición",
        value: "Estándar",
        price: 0,
        inventory: 25,
        sku: "APRO-STD",
      },
      {
        name: "Edición",
        value: "Con Estuche MagSafe",
        price: 20,
        inventory: 15,
        sku: "APRO-MAG",
      },
    ])
      await prisma.productVariant.create({
        data: { ...v, productId: airpods.id },
      });
  }
  console.log("✅ Variantes creadas");

  // Direcciones
  console.log("🏠 Creando direcciones...");
  const createdAddresses = [];
  for (const a of [
    {
      userId: testUser.id,
      street: "Avenida Reforma 123",
      city: "Ciudad de México",
      state: "CDMX",
      postalCode: "06600",
      country: "México",
      phone: "+52 55 1234 5678",
      isDefault: true,
    },
    {
      userId: testUser.id,
      street: "Calle Liverpool 45",
      city: "Guadalajara",
      state: "Jalisco",
      postalCode: "44100",
      country: "México",
      phone: "+52 33 9876 5432",
      isDefault: false,
    },
  ])
    createdAddresses.push(await prisma.address.create({ data: a }));
  console.log(`✅ ${createdAddresses.length} direcciones creadas`);

  // Órdenes
  console.log("📦 Creando órdenes de ejemplo...");
  const genNum = () =>
    `ORD-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")}`;

  const iphoneProduct = createdProducts.find((p) =>
    p.slug.includes("iphone-15"),
  );
  const airpodsProduct = createdProducts.find((p) =>
    p.slug.includes("airpods-pro"),
  );
  const macbookProduct = createdProducts.find((p) =>
    p.slug.includes("macbook-pro"),
  );
  const mouseProduct = createdProducts.find((p) =>
    p.slug.includes("logitech-mx"),
  );

  const order1 = await prisma.order.create({
    data: {
      userId: testUser.id,
      orderNumber: genNum(),
      total: 1549.97,
      status: OrderStatus.PENDING,
      shippingAddressId: createdAddresses[0].id,
      billingAddressId: createdAddresses[0].id,
      paymentMethod: "Tarjeta de crédito",
      paymentStatus: PaymentStatus.PENDING,
    },
  });
  if (iphoneProduct)
    await prisma.orderItem.create({
      data: {
        orderId: order1.id,
        productId: iphoneProduct.id,
        quantity: 1,
        price: 1299.99,
      },
    });
  if (airpodsProduct)
    await prisma.orderItem.create({
      data: {
        orderId: order1.id,
        productId: airpodsProduct.id,
        quantity: 1,
        price: 249.98,
      },
    });

  const order2 = await prisma.order.create({
    data: {
      userId: testUser.id,
      orderNumber: genNum(),
      total: 3299.99,
      status: OrderStatus.PROCESSING,
      shippingAddressId: createdAddresses[1].id,
      billingAddressId: createdAddresses[1].id,
      paymentMethod: "Transferencia bancaria",
      paymentStatus: PaymentStatus.PAID,
    },
  });
  if (macbookProduct)
    await prisma.orderItem.create({
      data: {
        orderId: order2.id,
        productId: macbookProduct.id,
        quantity: 1,
        price: 3299.99,
      },
    });

  const order3 = await prisma.order.create({
    data: {
      userId: testUser.id,
      orderNumber: genNum(),
      total: 99.99,
      status: OrderStatus.DELIVERED,
      shippingAddressId: createdAddresses[0].id,
      billingAddressId: createdAddresses[0].id,
      paymentMethod: "Tarjeta de débito",
      paymentStatus: PaymentStatus.PAID,
    },
  });
  if (mouseProduct)
    await prisma.orderItem.create({
      data: {
        orderId: order3.id,
        productId: mouseProduct.id,
        quantity: 1,
        price: 99.99,
      },
    });

  console.log(`✅ 3 órdenes creadas`);

  // Reseñas
  console.log("⭐ Creando reseñas...");
  let reviewCount = 0;
  for (const r of [
    {
      productId: macbookProduct?.id,
      userId: testUser.id,
      userName: "Usuario de Prueba",
      userEmail: "user@test.com",
      rating: 5,
      comment:
        "Increíble potencia para edición de video. La pantalla XDR es espectacular.",
      approved: true,
    },
    {
      productId: iphoneProduct?.id,
      userId: testUser.id,
      userName: "Usuario de Prueba",
      userEmail: "user@test.com",
      rating: 4,
      comment: "Excelente cámara, pero la batería podría durar más.",
      approved: true,
    },
    {
      productId: airpodsProduct?.id,
      userId: testUser.id,
      userName: "Usuario de Prueba",
      userEmail: "user@test.com",
      rating: 5,
      comment: "La cancelación de ruido funciona perfectamente en el metro.",
      approved: true,
    },
  ]) {
    if (r.productId) {
      await prisma.review.create({ data: r as any });
      reviewCount++;
    }
  }
  console.log(`✅ ${reviewCount} reseñas creadas`);

  // Carrito
  console.log("🛒 Creando carrito...");
  const cart = await prisma.cart.create({ data: { userId: testUser.id } });
  const dellProduct = createdProducts.find((p) => p.slug.includes("dell-xps"));
  const watchProduct = createdProducts.find((p) =>
    p.slug.includes("apple-watch"),
  );
  if (dellProduct)
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId: dellProduct.id, quantity: 1 },
    });
  if (watchProduct)
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId: watchProduct.id, quantity: 1 },
    });
  console.log("✅ Carrito creado con 2 productos");

  console.log("\n🎉 Seed completado exitosamente!");
  console.log("\n📊 Resumen:");
  console.log(`   👥 Usuarios: 2`);
  console.log(`   📂 Categorías: ${createdCategories.length}`);
  console.log(`   📦 Productos: ${createdProducts.length}`);
  console.log(`   📦 Variantes: 7`);
  console.log(`   🏠 Direcciones: ${createdAddresses.length}`);
  console.log(`   📦 Órdenes: 3`);
  console.log(`   ⭐ Reseñas: ${reviewCount}`);
  console.log(`   🛒 Carrito: 2 productos`);
  console.log("\n🔑 Credenciales:");
  console.log(`   👑 Admin: admin@test.com / password123`);
  console.log(`   👤 Usuario: user@test.com / password123`);
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
