import { ShoppingBag } from 'lucide-react'

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen w-full flex bg-white antialiased">
      
      {/* Left Panel: E-commerce Brand Showcase (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 bg-neutral-100 border-r border-neutral-300 flex-col justify-between p-12 xl:p-16 select-none">
        
        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-black text-white flex items-center justify-center font-bold">
            <ShoppingBag size={22} />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-black block leading-none">
              MINI STORE
            </span>
            <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-widest block mt-1">
              ផ្ទាំងគ្រប់គ្រងរដ្ឋបាល
            </span>
          </div>
        </div>

        {/* Center Content */}
        <div className="max-w-md my-auto space-y-8 py-10">
          <div className="space-y-4">
            <span className="inline-block px-3 py-1 bg-black text-white text-xs font-bold uppercase tracking-wider">
              E-Commerce Platform
            </span>
            <h2 className="text-4xl xl:text-5xl font-black text-black tracking-tight leading-[1.3]">
              គ្រប់គ្រងអាជីវកម្ម <br />
              យ៉ាងងាយស្រួល
            </h2>
            <p className="text-sm text-neutral-600 leading-relaxed font-normal">
              ប្រព័ន្ធគ្រប់គ្រងការលក់ និងស្តុកទំនិញទំនើប រចនាឡើងដើម្បីជួយសម្រួលដល់ការគ្រប់គ្រងហាងរបស់អ្នកឱ្យកាន់តែមានប្រសិទ្ធភាពខ្ពស់។
            </p>
          </div>

          {/* Simple Feature Highlights */}
          <div className="space-y-3 pt-2 border-t border-neutral-200">
            <div className="flex items-center gap-3 text-sm text-neutral-800 font-medium">
              <span className="w-1.5 h-1.5 bg-black inline-block" />
              <span>គ្រប់គ្រងស្តុកទំនិញ និងតម្លៃបានទាន់ពេល</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-neutral-800 font-medium">
              <span className="w-1.5 h-1.5 bg-black inline-block" />
              <span>តាមដានការបញ្ជាទិញ និងរបាយការណ៍លក់លម្អិត</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-neutral-800 font-medium">
              <span className="w-1.5 h-1.5 bg-black inline-block" />
              <span>សុវត្ថិភាពខ្ពស់ និងរហ័សទាន់ចិត្ត</span>
            </div>
          </div>
        </div>

        {/* Left Footer */}
        <div className="text-xs text-neutral-500 flex items-center justify-between border-t border-neutral-200 pt-4">
          <span>© 2026 MINI STORE</span>
          <span>ជំនាន់ ២.០</span>
        </div>
      </div>

      {/* Right Panel: Auth Form Container */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-12 xl:p-16">
        
        {/* Mobile Header */}
        <div className="flex lg:hidden items-center gap-3 pb-6 border-b border-neutral-200 select-none">
          <div className="w-9 h-9 bg-black text-white flex items-center justify-center font-bold">
            <ShoppingBag size={18} />
          </div>
          <div>
            <span className="text-base font-black tracking-tight text-black block leading-none">
              MINI STORE
            </span>
            <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest block mt-0.5">
              Admin Portal
            </span>
          </div>
        </div>

        {/* Centered Children (Forms) */}
        <div className="w-full max-w-sm mx-auto my-auto py-8">
          {children}
        </div>

        {/* Mobile/Right Footer */}
        <div className="text-center text-xs text-neutral-400 pt-4 select-none">
          © 2026 MINI STORE. រក្សាសិទ្ធិគ្រប់យ៉ាង។
        </div>

      </div>

    </div>
  )
}

