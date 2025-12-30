// src/pages/AboutPage.tsx
import { useTenant } from '@/contexts/TenantContext';
import { Mail, Phone, MapPin, History, Target, Eye, Truck } from 'lucide-react';

const AboutPage = () => {
  const { tenantInfo, isLoading } = useTenant();

  if (isLoading) {
    return (
      <div className="container mx-auto p-8 animate-pulse bg-background">
        <div className="h-64 bg-zinc-100 rounded-3xl mb-12"></div>
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="h-10 bg-zinc-100 rounded-xl w-1/3 mx-auto"></div>
          <div className="h-4 bg-zinc-100 rounded-full w-full"></div>
        </div>
      </div>
    );
  }

  if (!tenantInfo) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 bg-background">
        <h1 className="text-xl font-bold text-foreground uppercase tracking-tighter">Información no disponible</h1>
      </div>
    );
  }

  return (
    // bg-background asegura que el fondo sea el mismo blanco que tu Navbar
    <div className="bg-background text-foreground min-h-screen pb-20 pt-24 transition-colors">

      {/* Hero Section - Estilo B&W con degradado sutil */}
      <div className="relative h-72 md:h-96 w-full overflow-hidden border-b border-border">
        {tenantInfo.hero_banner_url ? (
          <img
            src={tenantInfo.hero_banner_url}
            alt="Empresa"
            className="w-full h-full object-cover grayscale opacity-50 dark:opacity-30"
          />
        ) : (
          <div className="w-full h-full bg-zinc-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-zinc-200/20 dark:to-slate-900/40"></div>
          </div>
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[10px] uppercase tracking-[0.5em] font-bold mb-3 text-muted-foreground">About</span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-center uppercase italic text-foreground">
            {tenantInfo.name || "Nuestra Casa"}
          </h1>
        </div>
      </div>

      <div className="container mx-auto max-w-5xl px-4 -mt-20 relative z-10">
        {/* Contenedor principal blanco con bordes como el Nav */}
        <div className="bg-white  border border-border rounded-[2.5rem] shadow-sm p-8 md:p-16">

          {/* Sección Filosofía / Introducción */}
          {tenantInfo.description && (
            <section className="max-w-3xl mx-auto text-center mb-24">
              <h2 className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.4em] mb-8">Nuestra Esencia</h2>
              <p className="text-2xl md:text-3xl text-foreground leading-tight font-light tracking-tight">
                "{tenantInfo.description}"
              </p>
            </section>
          )}

          <div className="grid gap-20">

            {/* Historia con estilo editorial */}
            {tenantInfo.about_us && (
              <section className="border-l-2   pl-8 md:pl-12">
                <div className="flex items-center gap-4 mb-8">
                  <History className="text-muted-foreground" size={20} strokeWidth={1.5} />
                  <h3 className="text-2xl font-black text-foreground uppercase tracking-tighter">Historia</h3>
                </div>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {tenantInfo.about_us}
                </p>
              </section>
            )}

            {/* Misión y Visión - Estilo idéntico en blanco/gris suave */}
            <div className="grid md:grid-cols-2 gap-8">
              {tenantInfo.mision && (
                <div className="p-10 bg-zinc-50   rounded-[2rem] border border-border">
                  <Target className="text-foreground mb-6" size={28} />
                  <h4 className="text-lg font-black text-foreground uppercase tracking-widest mb-4">Misión</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {tenantInfo.mision}
                  </p>
                </div>
              )}
              {tenantInfo.vision && (
                <div className="p-10 bg-zinc-50   rounded-[2rem] border border-border">
                  <Eye className="text-foreground mb-6" size={28} />
                  <h4 className="text-lg font-black text-foreground uppercase tracking-widest mb-4">Visión</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {tenantInfo.vision}
                  </p>
                </div>
              )}
            </div>

            {/* Sección de Contacto - Iconos monocromáticos */}
            <section className="pt-20 border-t border-border">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">

                <div className="flex flex-col items-center text-center group">
                  <MapPin className="text-muted-foreground mb-4 group-hover:text-foreground transition-colors" size={22} />
                  <span className="text-[10px] font-black text-muted-foreground uppercase mb-2">Ubicación</span>
                  <p className="text-xs font-bold">{tenantInfo.address}</p>
                </div>

                <div className="flex flex-col items-center text-center group">
                  <Phone className="text-muted-foreground mb-4 group-hover:text-foreground transition-colors" size={22} />
                  <span className="text-[10px] font-black text-muted-foreground uppercase mb-2">Teléfono</span>
                  <a href={`tel:${tenantInfo.contact_phone}`} className="text-xs font-bold hover:underline transition-all">
                    {tenantInfo.contact_phone}
                  </a>
                </div>

                <div className="flex flex-col items-center text-center group">
                  <Mail className="text-muted-foreground mb-4 group-hover:text-foreground transition-colors" size={22} />
                  <span className="text-[10px] font-black text-muted-foreground uppercase mb-2">Email</span>
                  <a href={`mailto:${tenantInfo.business_email}`} className="text-xs font-bold hover:underline break-all transition-all">
                    {tenantInfo.business_email}
                  </a>
                </div>

                <div className="flex flex-col items-center text-center group">
                  <Truck className="text-muted-foreground mb-4 group-hover:text-foreground transition-colors" size={22} />
                  <span className="text-[10px] font-black text-muted-foreground uppercase mb-2">Delivery</span>
                  <p className="text-xs font-bold">S/ {Number(tenantInfo.delivery_cost || 0).toFixed(2)}</p>
                </div>

              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;