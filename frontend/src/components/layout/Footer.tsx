import { useTenant } from '@/contexts/TenantContext';

const Footer = () => {
  const { tenantInfo } = useTenant();
  const year = new Date().getFullYear();

  const socialLinks = tenantInfo?.social_links;

  return (
    <footer className="bg-lime-950 text-white py-4">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 px-6">
        <div>
          <h3 className="text-lg font-semibold mb-1">{tenantInfo?.name || 'Empresa'}</h3>
          {tenantInfo?.logo_url && <img src={tenantInfo.logo_url} alt="Logo" className="h-10 mt-2" />}
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-1">Páginas</h3>
          <ul>
            <li className="mb-2"><a href="/nosotros" className="hover:underline">Nosotros</a></li>
            <li className="mb-2"><a href="/productos" className="hover:underline">Productos</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-1">Legal</h3>
           <ul>
            <li className="mb-2"><a href="/terminos" className="hover:underline">Términos y Condiciones</a></li>
            <li className="mb-2"><a href="/privacidad" className="hover:underline">Política de Privacidad</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-1">Contacto</h3>
          <p className="text-sm">{tenantInfo?.address}</p>
          <p className="text-sm">{tenantInfo?.contact_phone}</p>
          <p className="text-sm">{tenantInfo?.business_email}</p>
        </div>
      </div>
      <div className="flex md:gap-10 justify-center p-2 space-x-8 text-4xl">
        {socialLinks?.facebook && <a href={socialLinks.facebook} className="social-icon text-blue-600"><i className="fab fa-facebook"></i></a>}
        {socialLinks?.instagram && <a href={socialLinks.instagram} className="social-icon text-pink-500"><i className="fab fa-instagram"></i></a>}
        {socialLinks?.tiktok && <a href={socialLinks.tiktok} className="social-icon text-black"><i className="fab fa-tiktok"></i></a>}
        {socialLinks?.whatsapp && <a href={socialLinks.whatsapp} className="social-icon text-green-500"><i className="fab fa-whatsapp"></i></a>}
      </div>
      <div className="pt-2 text-center text-gray-400 text-sm">
        &copy; {year} - Todos los derechos reservados <a href="/" className="text-blue-400 hover:underline">{tenantInfo?.name || ''}</a>
      </div>
    </footer>
  );
};

export default Footer;
