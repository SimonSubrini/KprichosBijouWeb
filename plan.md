# Plan de Acción: E-commerce Catálogo "Kprichos Bijou"
## Fase 1: Arquitectura y Stack Tecnológico
### Frontend: React.js configurado con Vite.

### Estilos: Tailwind CSS.

### Base de Datos y CMS (Headless CMS): Sanity.io (Content Lake).

### Backend / API: Serverless Functions de Vercel (Node.js).

### Notificaciones: Resend (Email) o API de Telegram.

## Fase 2: Modelado de Datos (Sanity Schema)
### Se debe configurar Sanity Studio con los siguientes esquemas de documentos (Document Types):

### Producto (Product):

### name (String)

### description (Text)

### basePrice (Number)

### images (Array of Images)

### type (String: "stock" | "custom")

### stockCount (Number - Solo para tipo "stock")

### customizationOptions (Array of Objects - Solo para tipo "custom"). Debe incluir configuraciones dinámicas:

#### Tipo de variante (ej. Selector de Letra, Color, Estilo de tipografía, Adicionales con costo extra como pompones).

#### Orden de Compra (Order):

#### orderId (String - Generado automáticamente)

#### createdAt (Datetime)

#### items (Array de objetos con referencia al Producto, cantidad elegida y personalizaciones seleccionadas)

#### totalPrice (Number - Precio calculado en el servidor/aplicación, inalterable por el usuario)

#### status (String: "Pendiente de contacto", "Confirmado", "Cancelado")

#### Nota: El esquema de "Order" sentará las bases estructurales para el desarrollo futuro de un Dashboard de métricas de ventas.

## Fase 3: Desarrollo de la Interfaz (Frontend)
Desarrollo de componentes en React enfocados en UI/UX minimalista:

### Navegación: Header con logotipo y acceso al componente de Carrito.

### Vistas de Catálogo:

#### Sección A: Productos con disponibilidad inmediata (Stock).

#### Sección B: Productos a pedido (Personalizables).

#### Tarjetas de Producto (Product Cards):

#### Productos en stock: Botón directo de "Añadir al carrito".

#### Productos a pedido: Botón de "Personalizar". Abre un Modal/Drawer con los selectores configurados dinámicamente desde Sanity (letras, colores, extras).

#### Gestor del Carrito (State Management): Uso de Context API o Zustand para persistencia temporal del carrito durante la sesión. Cálculo dinámico de subtotales y total.

## Fase 4: Lógica de Checkout, Seguridad y Redirección
Flujo de ejecución secuencial al presionar "Finalizar Pedido" en el carrito:

### Llamada a la API (POST Request): El frontend envía el detalle del carrito a un endpoint seguro (Vercel Serverless Function: /api/checkout).

### Procesamiento Backend (Vercel Function):

#### Se recibe el payload.

#### Se utiliza el Sanity Client (con un Token de Escritura oculto en variables de entorno) para crear un nuevo documento tipo Order en la base de datos de Sanity.

#### Se dispara la notificación al administrador (vía Email usando Resend, o un mensaje vía Telegram Bot) detallando: ID de orden, artículos, personalizaciones y el precio total real para validación contra manipulaciones en el lado del cliente.

#### Generación de Mensaje y Redirección:

#### La API devuelve un status 200 y el orderId.

#### El frontend construye la URL de WhatsApp ([https://wa.me/](https://wa.me/)...) incluyendo un mensaje predeterminado que cite el orderId generado y el detalle del pedido.

#### Se redirige al usuario a la aplicación de WhatsApp.

## Fase 5: Despliegue, Infraestructura y Dominio
### Control de Versiones: Repositorio alojado en GitHub.

### Hosting Continuo (CI/CD): Vinculación del repositorio principal con Vercel. Cada evento push a la rama main disparará un build y despliegue automático.

### Configuración de Dominio Regional (.com.ar):

#### Registro de dominio en NIC Argentina (requiere acceso mediante clave fiscal de AFIP Nivel 2/3).

#### Abono del arancel anual correspondiente.

#### Configuración de DNS: Obtención de los Nameservers provistos por Vercel (ej. ns1.vercel-dns.com) e inserción de los mismos en el panel de delegación de dominio de NIC Argentina.

#### Verificación de propagación DNS y emisión automática de certificado SSL (HTTPS) por parte de Vercel.