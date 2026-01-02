import { ChefHat, UtensilsCrossed, Cake, Wine, Coffee } from 'lucide-react';

// Mapeo de categorías a iconos y colores
const categoryConfig = {
    principal: {
        icon: ChefHat,
        color: 'amber',
        bgClass: 'bg-amber-500/15',
        iconClass: 'text-amber-400',
        tagBgClass: 'bg-amber-900/20',
        tagTextClass: 'text-amber-300',
        label: 'Principal'
    },
    entrante: {
        icon: UtensilsCrossed,
        color: 'emerald',
        bgClass: 'bg-emerald-500/15',
        iconClass: 'text-emerald-400',
        tagBgClass: 'bg-emerald-900/20',
        tagTextClass: 'text-emerald-300',
        label: 'Entrante'
    },
    postre: {
        icon: Cake,
        color: 'pink',
        bgClass: 'bg-pink-500/15',
        iconClass: 'text-pink-400',
        tagBgClass: 'bg-pink-900/20',
        tagTextClass: 'text-pink-300',
        label: 'Postre'
    },
    bebida: {
        icon: Wine,
        color: 'sky',
        bgClass: 'bg-sky-500/15',
        iconClass: 'text-sky-400',
        tagBgClass: 'bg-sky-900/20',
        tagTextClass: 'text-sky-300',
        label: 'Bebida'
    },
    aperitivo: {
        icon: Coffee,
        color: 'orange',
        bgClass: 'bg-orange-500/15',
        iconClass: 'text-orange-400',
        tagBgClass: 'bg-orange-900/20',
        tagTextClass: 'text-orange-300',
        label: 'Aperitivo'
    }
};

// Componente de icono de categoría
export function CategoryIcon({ category, size = 'md' }) {
    const config = categoryConfig[category?.toLowerCase()] || categoryConfig.principal;
    const Icon = config.icon;

    const sizeClasses = {
        sm: 'w-10 h-10',
        md: 'w-14 h-14',
        lg: 'w-16 h-16'
    };

    const iconSizes = {
        sm: 'h-5 w-5',
        md: 'h-7 w-7',
        lg: 'h-8 w-8'
    };

    return (
        <div className={`${sizeClasses[size]} ${config.bgClass} rounded-2xl flex items-center justify-center flex-shrink-0`}>
            <Icon className={`${iconSizes[size]} ${config.iconClass}`} />
        </div>
    );
}

// Helper para obtener configuración de categoría
export function getCategoryConfig(category) {
    return categoryConfig[category?.toLowerCase()] || categoryConfig.principal;
}

export default categoryConfig;
