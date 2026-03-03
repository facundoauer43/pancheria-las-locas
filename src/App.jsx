import { useState, useEffect } from 'react'
import productos from './data/products.json'
import './index.css'

function App() {
    const [cart, setCart] = useState([])
    const [isCartOpen, setIsCartOpen] = useState(false)
    const [editingItem, setEditingItem] = useState(null)
    const [tempCondiments, setTempCondiments] = useState([])
    const [view, setView] = useState('menu') // 'menu', 'login', 'register'
    const [user, setUser] = useState(null) // { nombre, direccion, telefono, documento, entreCalles }


    // Bloquear scroll del body cuando el modal está abierto
    useEffect(() => {
        if (editingItem) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [editingItem])


    const todosLosCondimentos = [
        'Mostaza', 'Ketchup', 'Mayonesa', 'Lluvia de Papas',
        'Cheddar', 'Bacon', 'Cebolla Caramelizada',
        'Guacamole', 'Jalapeños', 'Pico de Gallo', 'Queso', 'Papas Fritas'
    ]

    const addToCart = (producto) => {
        const newItem = {
            ...producto,
            idEnCarrito: Date.now(),
            condimentosFinales: [...producto.condimentos],
            precioBase: producto.precio // Guardamos el precio original
        }
        setCart([...cart, newItem])
        setIsCartOpen(true)
    }

    const openEditor = (item) => {
        setEditingItem(item)
        setTempCondiments([...item.condimentosFinales])
    }

    const toggleCondiment = (cond) => {
        if (tempCondiments.includes(cond)) {
            setTempCondiments(tempCondiments.filter(c => c !== cond))
        } else {
            setTempCondiments([...tempCondiments, cond])
        }
    }

    const saveChanges = () => {
        setCart(cart.map(item => {
            if (item.idEnCarrito === editingItem.idEnCarrito) {
                // Calcular cuántos extras (que NO venían en el pancho original) se agregaron
                const extrasAgregados = tempCondiments.filter(cond => !item.condimentos.includes(cond))

                // El aumento es del 10% del precio original por cada extra
                const aumentoTotal = (item.precioBase * 0.10) * extrasAgregados.length

                return {
                    ...item,
                    condimentosFinales: tempCondiments,
                    precio: item.precioBase + aumentoTotal
                }
            }
            return item
        }))
        setEditingItem(null)
    }

    const removeFromCart = (idEnCarrito) => {
        setCart(cart.filter(item => item.idEnCarrito !== idEnCarrito))
    }

    const totalCarrito = cart.reduce((acc, item) => acc + item.precio, 0)

    const handleWhatsAppCheckout = () => {
        if (!user) {
            setView('login')
            setIsCartOpen(false)
            return
        }

        const itemsText = cart.map(item =>
            `- *${item.nombre}* ($${item.precio})\n  Extras: ${item.condimentosFinales.join(', ')}`
        ).join('\n')

        const mensaje = `🌭 *NUEVO PEDIDO - Panchería Las Locas* 🌭\n\n` +
            `*Cliente:* ${user.nombre}\n` +
            `*Dirección:* ${user.direccion}\n` +
            `*Teléfono:* ${user.telefono}\n` +
            `*Documento:* ${user.documento}\n` +
            `*Entre Calles:* ${user.entreCalles || '-'}\n\n` +
            `*Detalle del Pedido:*\n${itemsText}\n\n` +
            `*Total a pagar: $${totalCarrito}*\n\n` +
            `¡Espero mi pedido!`

        const numeroTelefono = '5491139330392' // Número WhatsApp
        const url = `https://wa.me/${numeroTelefono}?text=${encodeURIComponent(mensaje)}`
        window.open(url, '_blank')
    }

    return (
        <div className="min-h-screen bg-dark">
            {/* HEADER: GOURMET BRANDING - CENTERED */}
            <header className="header-glass fixed top-0 left-0 right-0 z-50 p-4 animate-fade-in flex items-center justify-between">

                {/* User Section (Left) */}
                <div className="flex flex-col ml-2 md:ml-8 min-w-[100px] z-50">
                    {user ? (
                        <div className="flex flex-col animate-fade-in bg-black/50 p-2 rounded-xl border border-white/10">
                            <span className="text-sm font-bold text-primary">¡Hola, {user.nombre}!</span>
                            <span className="text-xs text-white/60 truncate">{user.direccion}</span>
                            <button onClick={() => setUser(null)} className="text-xs text-white/40 hover:text-white text-left mt-1 underline">Cerrar sesión</button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setView('login')}
                            className="bg-primary/90 text-black border border-white/20 rounded-full px-3 md:px-5 py-2 text-xs md:text-sm font-black tracking-wider transition-all hover:scale-105 shadow-xl whitespace-nowrap"
                            style={{ backgroundColor: 'var(--primary-color)' }}
                        >
                            INICIAR SESIÓN
                        </button>
                    )}
                </div>

                {/* Brand (Center) */}
                <div className="header-content-centered absolute left-1/2 -translate-x-1/2 top-4">
                    <div className="brand-container">
                        <h1 className="brand-title">
                            <span className="brand-top">PANCHERÍA</span>
                            <span className="brand-bottom">LAS LOCAS</span>
                        </h1>
                        <div className="brand-underline"></div>
                    </div>
                </div>

                {/* Empty Right (balance) */}
                <div className="hidden md:block min-w-[150px]"></div>


                <button
                    onClick={() => setIsCartOpen(true)}
                    className="cart-trigger-fixed"
                >
                    <span className="cart-icon">🛒</span>
                    <span className="cart-badge">{cart.length}</span>
                </button>
            </header>

            <main>
                {/* MENU GRID SECTION */}
                <section id="inicio" className="flex flex-col items-center justify-start section-padding">
                    <div
                        className="background-overlay"
                        style={{ backgroundImage: 'url("/hero.png")' }}
                    ></div>

                    <h2 className="menu-title relative z-10 animate-fade-in">
                        NUESTRO MENÚ
                    </h2>

                    <div className="product-grid container relative z-10 animate-fade-in">
                        {productos.map(p => (
                            <div key={p.id} className="product-card">
                                <div className="card-image-container">
                                    <div className="card-image" style={{ backgroundImage: `url(${p.img})` }}></div>
                                </div>
                                <div className="card-content">
                                    <h3 className="card-title">{p.nombre}</h3>
                                    <div className="card-divider"></div>
                                    <p className="card-description">
                                        {p.condimentos.join(', ') + '...'}
                                    </p>

                                    <div className="product-action-area">
                                        <span className="price-tag">${p.precio}</span>
                                        <button
                                            onClick={() => addToCart(p)}
                                            className="add-to-cart-btn-menu"
                                        >
                                            AGREGAR AL CARRITO 🌭
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            {/* FOOTER */}
            <footer className="footer-simple relative z-10">
                <p>&copy; 2026 Panchería Las Locas. El sabor más loco de la ciudad.</p>
            </footer>

            {/* INTEGRATED EDIT MODAL */}
            {editingItem && (
                <div className="modal-overlay z-[2000]" onClick={() => setEditingItem(null)}>
                    <div className="modal-content animate-fade-in" onClick={e => e.stopPropagation()}>
                        <h3 className="text-2xl font-black mb-1 text-center" style={{ color: '#a63d00' }}>
                            PERSONALIZAR
                        </h3>
                        <p className="text-center mb-6 text-secondary text-sm">
                            Agregá o quitá ingredientes para tu <strong>{editingItem.nombre}</strong>
                        </p>

                        <div className="condiments-list custom-scrollbar">
                            {todosLosCondimentos.map(cond => {
                                const isExtra = !editingItem.condimentos.includes(cond)
                                return (
                                    <label key={cond} className="modal-condiment-item cursor-pointer flex items-center justify-between group">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-sm uppercase tracking-tight">{cond}</span>
                                            {isExtra && <span className="text-[10px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">(+10%)</span>}
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={tempCondiments.includes(cond)}
                                            onChange={() => toggleCondiment(cond)}
                                            className="custom-checkbox group-hover:scale-110 transition-transform"
                                        />
                                    </label>
                                )
                            })}
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setEditingItem(null)}
                                className="btn-secondary flex-1"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={saveChanges}
                                className="btn-primary flex-[2]"
                            >
                                Guardar ✨
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* AUTH MODALS */}
            {(view === 'login' || view === 'register') && (
                <div className="modal-overlay z-[3000]" onClick={() => setView('menu')}>
                    {view === 'login' && (
                        <div className="modal-content animate-fade-in text-center p-8 max-w-sm rounded-3xl" onClick={e => e.stopPropagation()}>
                            <h2 className="text-3xl font-black mb-6" style={{ color: 'var(--primary-color)' }}>INICIAR SESIÓN</h2>

                            <div className="space-y-4 text-left">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1 text-left">Nombre o Email registrado</label>
                                    <input
                                        type="text"
                                        id="login-input"
                                        className="w-full bg-gray-100 border border-gray-300 rounded-xl p-3 text-black focus:outline-none focus:border-yellow-500"
                                        placeholder="Ingresá tu nombre"
                                    />
                                </div>

                                <button
                                    onClick={() => {
                                        const val = document.getElementById('login-input').value;
                                        if (val) {
                                            setUser({ nombre: val, direccion: 'Simulada 123', telefono: '1122334455', documento: '12345678', entreCalles: '' })
                                            setView('menu')
                                        } else {
                                            alert('Ingresá un nombre')
                                        }
                                    }}
                                    className="w-full bg-[var(--primary-color)] text-black font-black text-xl p-3 rounded-xl hover:scale-105 transition-transform mt-2"
                                >
                                    ENTRAR
                                </button>

                                <div className="text-center mt-4">
                                    <p className="text-gray-500 mb-2 text-sm">¿No tenés cuenta?</p>
                                    <button
                                        onClick={() => setView('register')}
                                        className="text-[var(--accent-orange)] font-bold hover:underline"
                                    >
                                        Registrarse para Delivery
                                    </button>
                                </div>
                                <div className="text-center mt-2">
                                    <button
                                        onClick={() => setView('menu')}
                                        className="text-gray-400 text-sm hover:text-gray-600 transition-colors underline"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {view === 'register' && (
                        <div className="modal-content animate-fade-in p-8 max-w-md rounded-3xl w-[95%]" onClick={e => e.stopPropagation()}>
                            <h2 className="text-3xl font-black text-center mb-2" style={{ color: 'var(--primary-color)' }}>CREAR CUENTA</h2>
                            <p className="text-center text-gray-500 mb-6 text-sm">Necesitamos tus datos para el envío</p>

                            <form
                                className="space-y-4 text-left"
                                onSubmit={(e) => {
                                    e.preventDefault()
                                    const fd = new FormData(e.target)
                                    setUser({
                                        nombre: fd.get('nombre'),
                                        direccion: fd.get('direccion'),
                                        telefono: fd.get('telefono'),
                                        documento: fd.get('documento'),
                                        entreCalles: fd.get('entreCalles')
                                    })
                                    setView('menu')
                                }}
                            >
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Nombre Completo *</label>
                                    <input name="nombre" required type="text" className="w-full bg-gray-100 border border-gray-300 rounded-xl p-3 text-black focus:outline-none focus:border-yellow-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Dirección exacta *</label>
                                    <input name="direccion" required type="text" className="w-full bg-gray-100 border border-gray-300 rounded-xl p-3 text-black focus:outline-none focus:border-yellow-500" placeholder="Ej: Av. San Martín 1234" />
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Cód. Postal *</label>
                                        <input name="cp" required type="text" className="w-full bg-gray-100 border border-gray-300 rounded-xl p-3 text-black focus:outline-none focus:border-yellow-500" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Entre Calles</label>
                                    <input name="entreCalles" type="text" className="w-full bg-gray-100 border border-gray-300 rounded-xl p-3 text-black focus:outline-none focus:border-yellow-500" placeholder="Ej: Belgrano y Moreno" />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-[var(--primary-color)] text-black font-black text-xl p-3 rounded-xl hover:scale-105 transition-transform mt-4"
                                >
                                    GUARDAR Y PEDIR
                                </button>

                                <div className="flex justify-between items-center mt-4 text-sm">
                                    <button
                                        type="button"
                                        onClick={() => setView('menu')}
                                        className="text-gray-400 hover:text-gray-600 underline"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setView('login')}
                                        className="text-[var(--accent-orange)] font-bold hover:underline"
                                    >
                                        Ya tengo cuenta
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            )}


            {/* CART SIDEBAR */}
            <div className={`cart-sidebar ${isCartOpen ? 'open' : ''}`}>
                <div className="p-8 h-full flex flex-col">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-3xl font-black italic" style={{ color: 'var(--primary-color)' }}>TU PEDIDO</h3>
                        <button onClick={() => setIsCartOpen(false)} className="close-cart-btn">×</button>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {cart.length === 0 ? (
                            <div className="empty-cart-msg">
                                <span className="text-6xl mb-4">🌭</span>
                                <p className="text-secondary">Tu carrito está vacío.</p>
                                <p className="text-sm">¡Empezá agregando un pancho!</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-8">
                                {cart.map((item) => (
                                    <div key={item.idEnCarrito} className="cart-item-modern">
                                        <div className="cart-item-image" style={{ backgroundImage: `url(${item.img})` }}></div>
                                        <div className="cart-item-details">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-bold text-white leading-tight">{item.nombre}</span>
                                                <span className="font-black text-primary">
                                                    ${item.precio}
                                                    {item.precio > item.precioBase && <span className="text-xs text-secondary italic ml-1">(con extras)</span>}
                                                </span>
                                            </div>
                                            <div className="extras-list mt-2">
                                                <span className="extras-label">DETALLE:</span>
                                                <p className="extras-text">
                                                    {item.condimentosFinales.join(', ')}
                                                </p>
                                            </div>
                                            <div className="flex gap-4 mt-4">
                                                <button
                                                    onClick={() => openEditor(item)}
                                                    className="edit-btn-sidebar"
                                                >
                                                    ✎ Editar ingredientes
                                                </button>
                                                <button
                                                    onClick={() => removeFromCart(item.idEnCarrito)}
                                                    className="remove-btn-sidebar"
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="cart-footer mt-auto pt-8 border-t border-white/10">
                        <div className="flex justify-between text-2xl font-black mb-8 px-2">
                            <span className="text-secondary">TOTAL</span>
                            <span className="text-primary">${totalCarrito}</span>
                        </div>
                        {user ? (
                            <button
                                onClick={handleWhatsAppCheckout}
                                disabled={cart.length === 0}
                                className="checkout-btn w-full hover:scale-105 transition-transform"
                            >
                                PEDIR POR WHATSAPP 📲
                            </button>
                        ) : (
                            <button
                                onClick={() => {
                                    setIsCartOpen(false)
                                    setView('login')
                                }}
                                className="checkout-btn w-full hover:scale-105 transition-transform"
                                style={{
                                    background: 'var(--bg-dark)',
                                    color: 'white',
                                    border: '1px solid var(--primary-color)'
                                }}
                            >
                                INICIAR SESIÓN PARA PEDIR ✨
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* OVERLAY FOR CART */}
            {isCartOpen && <div className="cart-overlay" onClick={() => setIsCartOpen(false)}></div>}
        </div>
    )
}

export default App
