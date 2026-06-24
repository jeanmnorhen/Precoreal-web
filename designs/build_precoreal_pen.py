import json, copy

# Read Lunaris file
with open('C:/Users/Jean/.pencil/documents/a05f66a3-bad8-44d3-b1b0-3f4bb8d375da/pencil-lunaris.pen', 'r', encoding='utf-8') as f:
    lunaris = json.load(f)

# Start building our file
doc = {
    "version": "2.6",
    "children": []
}

# --- Frame 1: Lunaris components ---
lunaris_frame = lunaris['children'][0]
lunaris_frame['x'] = 0
lunaris_frame['y'] = 0
doc['children'].append(lunaris_frame)

# --- Frame 2: PrecoReal Brand Tokens ---
brand_frame = {
    "type": "frame",
    "id": "precoreal-brand",
    "x": 3100,
    "y": 0,
    "name": "PrecoReal: Brand Tokens",
    "clip": True,
    "width": 600,
    "height": 400,
    "fill": "$--background",
    "layout": "vertical",
    "gap": 16,
    "padding": [32, 32],
    "children": [
        {
            "type": "text",
            "id": "brand-title",
            "name": "Title",
            "fill": "$--foreground",
            "content": "Preço Real — Brand Colors",
            "lineHeight": 1.2,
            "fontFamily": "$--font-primary",
            "fontSize": 24,
            "fontWeight": "700"
        },
        # Color swatches
        {"type": "text", "id": "swatch-title", "name": "Swatch Title", "fill": "$--muted-foreground", "content": "Navy (Primary)  #1E3A5F", "lineHeight": 1.4, "fontFamily": "$--font-secondary", "fontSize": 14, "fontWeight": "400"},
        {"type": "text", "id": "swatch-terracota", "name": "Swatch Terracota", "fill": "$--muted-foreground", "content": "Terracota (Accent)  #C86A3A", "lineHeight": 1.4, "fontFamily": "$--font-secondary", "fontSize": 14, "fontWeight": "400"},
        {"type": "text", "id": "swatch-verde", "name": "Swatch Verde", "fill": "$--muted-foreground", "content": "Verde Biofilico (Success)  #5A8F6A", "lineHeight": 1.4, "fontFamily": "$--font-secondary", "fontSize": 14, "fontWeight": "400"},
        {"type": "text", "id": "swatch-wood", "name": "Swatch Wood", "fill": "$--muted-foreground", "content": "Wood (Decorative)  #8B7355", "lineHeight": 1.4, "fontFamily": "$--font-secondary", "fontSize": 14, "fontWeight": "400"},
        {"type": "text", "id": "swatch-dark", "name": "Swatch Dark", "fill": "$--muted-foreground", "content": "Background  #1A1A1A", "lineHeight": 1.4, "fontFamily": "$--font-secondary", "fontSize": 14, "fontWeight": "400"},
    ]
}
doc['children'].append(brand_frame)

# --- Frame 3: PrecoReal Custom Components ---
# These are custom components specific to PrecoReal that don't exist in Lunaris
custom_components_frame = {
    "type": "frame",
    "id": "precoreal-components",
    "x": 3100,
    "y": 450,
    "name": "PrecoReal: Custom Components",
    "clip": True,
    "width": 1200,
    "height": 1200,
    "fill": "$--background",
    "layout": "none",
    "children": []
}

# Bottom Navigation bar (mobile)
bottom_nav = {
    "type": "frame",
    "id": "bottom-nav",
    "x": 0,
    "y": 0,
    "name": "BottomNav",
    "reusable": True,
    "clip": True,
    "width": 390,
    "height": 64,
    "fill": "$--card",
    "stroke": {"align": "inside", "thickness": 1, "fill": "$--border"},
    "cornerRadius": 0,
    "padding": [0, 8, 0, 8],
    "layout": "horizontal",
    "gap": 8,
    "justifyContent": "space-around",
    "alignItems": "center",
    "children": [
        {"type": "text", "id": "bn-home", "name": "Home", "fill": "$--primary", "content": "\uD83C\uDFE0 Inicio", "fontSize": 12, "fontFamily": "$--font-secondary", "fontWeight": "500"},
        {"type": "text", "id": "bn-search", "name": "Search", "fill": "$--muted-foreground", "content": "\uD83D\uDD0D Buscar", "fontSize": 12, "fontFamily": "$--font-secondary", "fontWeight": "500"},
        {"type": "text", "id": "bn-scan", "name": "Scanner", "fill": "$--muted-foreground", "content": "\uD83D\uDCF7 Escanear", "fontSize": 12, "fontFamily": "$--font-secondary", "fontWeight": "500"},
        {"type": "text", "id": "bn-profile", "name": "Profile", "fill": "$--muted-foreground", "content": "\uD83D\uDC64 Perfil", "fontSize": 12, "fontFamily": "$--font-secondary", "fontWeight": "500"},
    ]
}
custom_components_frame['children'].append(bottom_nav)

# Offer Card (vertical)
offer_card = {
    "type": "frame",
    "id": "offer-card",
    "x": 0,
    "y": 80,
    "name": "OfferCard",
    "reusable": True,
    "clip": True,
    "width": 180,
    "height": 260,
    "fill": "$--card",
    "stroke": {"align": "inside", "thickness": 1, "fill": "$--border"},
    "cornerRadius": 16,
    "layout": "vertical",
    "gap": 8,
    "padding": [12, 12],
    "children": [
        {
            "type": "frame",
            "id": "oc-image",
            "name": "Product Image",
            "clip": True,
            "width": 156,
            "height": 100,
            "fill": "$--secondary",
            "cornerRadius": 8,
            "layout": "none"
        },
        {
            "type": "text",
            "id": "oc-badge",
            "name": "Badge",
            "fill": "$--color-success",
            "content": "OFERTA",
            "fontSize": 10,
            "fontFamily": "$--font-secondary",
            "fontWeight": "700"
        },
        {
            "type": "text",
            "id": "oc-title",
            "name": "Product Title",
            "fill": "$--foreground",
            "content": "Nome do Produto",
            "fontSize": 14,
            "fontFamily": "$--font-secondary",
            "fontWeight": "600",
            "width": 156,
            "lineHeight": 1.2
        },
        {
            "type": "text",
            "id": "oc-store",
            "name": "Store Name",
            "fill": "$--muted-foreground",
            "content": "Nome da Loja",
            "fontSize": 12,
            "fontFamily": "$--font-secondary",
            "fontWeight": "400"
        },
        {
            "type": "text",
            "id": "oc-price",
            "name": "Price",
            "fill": "$--color-success",
            "content": "R$ 12,90",
            "fontSize": 20,
            "fontFamily": "$--font-primary",
            "fontWeight": "800"
        },
        {
            "type": "text",
            "id": "oc-distance",
            "name": "Distance",
            "fill": "$--muted-foreground",
            "content": "2,3 km",
            "fontSize": 11,
            "fontFamily": "$--font-secondary",
            "fontWeight": "400"
        }
    ]
}
custom_components_frame['children'].append(offer_card)

# Offer Card Horizontal
offer_card_h = {
    "type": "frame",
    "id": "offer-card-h",
    "x": 200,
    "y": 80,
    "name": "OfferCardHorizontal",
    "reusable": True,
    "clip": True,
    "width": 176,
    "height": 220,
    "fill": "$--card",
    "stroke": {"align": "inside", "thickness": 1, "fill": "$--border"},
    "cornerRadius": 16,
    "layout": "vertical",
    "gap": 6,
    "padding": [10, 10],
    "children": [
        {"type": "frame", "id": "och-img", "name": "Image", "clip": True, "width": 156, "height": 90, "fill": "$--secondary", "cornerRadius": 8, "layout": "none"},
        {"type": "text", "id": "och-badge", "name": "Badge", "fill": "$--color-warning", "content": "PROMOCAO", "fontSize": 9, "fontFamily": "$--font-secondary", "fontWeight": "700"},
        {"type": "text", "id": "och-title", "name": "Title", "fill": "$--foreground", "content": "Produto", "fontSize": 13, "fontFamily": "$--font-secondary", "fontWeight": "600"},
        {"type": "text", "id": "och-price", "name": "Price", "fill": "$--color-success", "content": "R$ 8,50", "fontSize": 16, "fontFamily": "$--font-primary", "fontWeight": "800"},
    ]
}
custom_components_frame['children'].append(offer_card_h)

# Category Filters
cat_filters = {
    "type": "frame",
    "id": "category-filters",
    "x": 0,
    "y": 360,
    "name": "CategoryFilters",
    "reusable": True,
    "clip": True,
    "width": 390,
    "height": 44,
    "fill": [],
    "layout": "horizontal",
    "gap": 8,
    "padding": [0, 16],
    "alignItems": "center",
    "children": [
        {"type": "frame", "id": "cf-todas", "name": "Todas", "reusable": False, "clip": True, "width": 70, "height": 32, "fill": "$--primary", "cornerRadius": 9999, "padding": [0, 14], "justifyContent": "center", "children": [{"type": "text", "id": "cf-todas-txt", "name": "Text", "fill": "$--primary-foreground", "content": "Todas", "fontSize": 12, "fontWeight": "500", "fontFamily": "$--font-secondary"}]},
        {"type": "frame", "id": "cf-leite", "name": "Laticinios", "reusable": False, "clip": True, "width": 90, "height": 32, "fill": "$--secondary", "cornerRadius": 9999, "padding": [0, 14], "justifyContent": "center", "children": [{"type": "text", "id": "cf-leite-txt", "name": "Text", "fill": "$--foreground", "content": "Laticinios", "fontSize": 12, "fontWeight": "500", "fontFamily": "$--font-secondary"}]},
        {"type": "frame", "id": "cf-bebidas", "name": "Bebidas", "reusable": False, "clip": True, "width": 80, "height": 32, "fill": "$--secondary", "cornerRadius": 9999, "padding": [0, 14], "justifyContent": "center", "children": [{"type": "text", "id": "cf-bebidas-txt", "name": "Text", "fill": "$--foreground", "content": "Bebidas", "fontSize": 12, "fontWeight": "500", "fontFamily": "$--font-secondary"}]},
        {"type": "frame", "id": "cf-carnes", "name": "Carnes", "reusable": False, "clip": True, "width": 70, "height": 32, "fill": "$--secondary", "cornerRadius": 9999, "padding": [0, 14], "justifyContent": "center", "children": [{"type": "text", "id": "cf-carnes-txt", "name": "Text", "fill": "$--foreground", "content": "Carnes", "fontSize": 12, "fontWeight": "500", "fontFamily": "$--font-secondary"}]},
    ]
}
custom_components_frame['children'].append(cat_filters)

# Badge PrecoReal
badge_pr = {
    "type": "frame",
    "id": "badge-preco",
    "x": 0,
    "y": 420,
    "name": "BadgePrecoReal",
    "reusable": True,
    "clip": True,
    "width": 100,
    "height": 24,
    "fill": "$--color-success",
    "cornerRadius": 9999,
    "padding": [0, 10],
    "justifyContent": "center",
    "alignItems": "center",
    "gap": 4,
    "children": [
        {"type": "text", "id": "bp-icon", "name": "Icon", "fill": "$--color-success-foreground", "content": "\uD83D\uDCE2", "fontSize": 10},
        {"type": "text", "id": "bp-label", "name": "Label", "fill": "$--color-success-foreground", "content": "Oferta", "fontSize": 11, "fontFamily": "$--font-secondary", "fontWeight": "600"},
    ]
}
custom_components_frame['children'].append(badge_pr)

# Price Display
price_display = {
    "type": "frame",
    "id": "price-display",
    "x": 120,
    "y": 420,
    "name": "PriceDisplay",
    "reusable": True,
    "clip": True,
    "width": 120,
    "height": 32,
    "fill": [],
    "layout": "horizontal",
    "gap": 2,
    "alignItems": "baseline",
    "children": [
        {"type": "text", "id": "pd-currency", "name": "Currency", "fill": "$--color-success", "content": "R$", "fontSize": 14, "fontFamily": "$--font-primary", "fontWeight": "700"},
        {"type": "text", "id": "pd-amount", "name": "Amount", "fill": "$--color-success", "content": "12", "fontSize": 24, "fontFamily": "$--font-primary", "fontWeight": "800"},
        {"type": "text", "id": "pd-cents", "name": "Cents", "fill": "$--color-success", "content": ",90", "fontSize": 14, "fontFamily": "$--font-primary", "fontWeight": "700"},
    ]
}
custom_components_frame['children'].append(price_display)

# TopBar
top_bar = {
    "type": "frame",
    "id": "top-bar",
    "x": 0,
    "y": 480,
    "name": "TopBar",
    "reusable": True,
    "clip": True,
    "width": 390,
    "height": 56,
    "fill": "$--card",
    "stroke": {"align": "inside", "thickness": 1, "fill": "$--border"},
    "padding": [0, 16],
    "layout": "horizontal",
    "gap": 12,
    "alignItems": "center",
    "justifyContent": "space-between",
    "children": [
        {"type": "text", "id": "tb-logo", "name": "Logo", "fill": "$--foreground", "content": "Preco Real", "fontSize": 18, "fontFamily": "$--font-primary", "fontWeight": "700"},
        {"type": "frame", "id": "tb-actions", "name": "Actions", "fill": [], "layout": "horizontal", "gap": 12, "alignItems": "center", "children": [
            {"type": "frame", "id": "tb-scan", "name": "Scan Icon", "clip": True, "width": 32, "height": 32, "fill": "$--secondary", "cornerRadius": 8, "justifyContent": "center", "alignItems": "center", "children": [{"type": "text", "id": "tb-scan-icon", "name": "Icon", "fill": "$--foreground", "content": "\uD83D\uDCF7", "fontSize": 16}]},
            {"type": "frame", "id": "tb-avatar", "name": "User Avatar", "clip": True, "width": 32, "height": 32, "fill": "$--primary", "cornerRadius": 9999, "justifyContent": "center", "alignItems": "center", "children": [{"type": "text", "id": "tb-avatar-txt", "name": "Initials", "fill": "$--primary-foreground", "content": "J", "fontSize": 14, "fontWeight": "600"}]}
        ]}
    ]
}
custom_components_frame['children'].append(top_bar)

doc['children'].append(custom_components_frame)

# --- Frame 4: Consumer Screens ---
screens_frame = {
    "type": "frame",
    "id": "consumer-screens",
    "x": 0,
    "y": 4500,
    "name": "PrecoReal: Consumer Screens",
    "clip": True,
    "width": 3000,
    "height": 4400,
    "fill": "$--background",
    "layout": "none",
    "children": []
}

# Login Screen (mobile 390x844)
login_screen = {
    "type": "frame",
    "id": "screen-login",
    "x": 40,
    "y": 40,
    "name": "Login",
    "clip": True,
    "width": 390,
    "height": 844,
    "fill": "$--background",
    "layout": "vertical",
    "gap": 24,
    "padding": [48, 24],
    "alignItems": "center",
    "justifyContent": "center",
    "children": [
        {"type": "text", "id": "login-logo", "name": "Logo", "fill": "$--foreground", "content": "PRECO REAL", "fontSize": 32, "fontFamily": "$--font-primary", "fontWeight": "800"},
        {"type": "text", "id": "login-desc", "name": "Description", "fill": "$--muted-foreground", "content": "Compare precos perto de voce", "fontSize": 14, "fontFamily": "$--font-secondary", "fontWeight": "400", "textAlign": "center"},
        {"type": "frame", "id": "login-email", "name": "Email Input", "clip": True, "width": 320, "height": 48, "fill": "$--input", "cornerRadius": 24, "stroke": {"align": "inside", "thickness": 1, "fill": "$--border"}, "padding": [0, 16], "justifyContent": "center", "children": [{"type": "text", "id": "login-email-txt", "name": "Placeholder", "fill": "$--muted-foreground", "content": "seu@email.com", "fontSize": 14}]},
        {"type": "frame", "id": "login-pass", "name": "Password Input", "clip": True, "width": 320, "height": 48, "fill": "$--input", "cornerRadius": 24, "stroke": {"align": "inside", "thickness": 1, "fill": "$--border"}, "padding": [0, 16], "justifyContent": "center", "children": [{"type": "text", "id": "login-pass-txt", "name": "Placeholder", "fill": "$--muted-foreground", "content": "********", "fontSize": 14}]},
        {"type": "frame", "id": "login-btn", "name": "Login Button", "clip": True, "width": 320, "height": 48, "fill": "$--primary", "cornerRadius": 24, "padding": [0, 16], "justifyContent": "center", "alignItems": "center", "children": [{"type": "text", "id": "login-btn-txt", "name": "Text", "fill": "$--primary-foreground", "content": "Entrar", "fontSize": 16, "fontFamily": "$--font-secondary", "fontWeight": "600"}]},
        {"type": "text", "id": "login-register-link", "name": "Register Link", "fill": "$--primary", "content": "Criar conta", "fontSize": 14, "fontFamily": "$--font-secondary", "fontWeight": "500"},
    ]
}
screens_frame['children'].append(login_screen)

# Register screen
register_screen = {
    "type": "frame",
    "id": "screen-register",
    "x": 480,
    "y": 40,
    "name": "Register",
    "clip": True,
    "width": 390,
    "height": 844,
    "fill": "$--background",
    "layout": "vertical",
    "gap": 20,
    "padding": [48, 24],
    "alignItems": "center",
    "children": [
        {"type": "text", "id": "reg-title", "name": "Title", "fill": "$--foreground", "content": "Criar Conta", "fontSize": 28, "fontFamily": "$--font-primary", "fontWeight": "700"},
        {"type": "frame", "id": "reg-name", "name": "Name Input", "clip": True, "width": 320, "height": 48, "fill": "$--input", "cornerRadius": 24, "stroke": {"align": "inside", "thickness": 1, "fill": "$--border"}, "padding": [0, 16], "justifyContent": "center", "children": [{"type": "text", "id": "reg-name-txt", "name": "Placeholder", "fill": "$--muted-foreground", "content": "Nome completo", "fontSize": 14}]},
        {"type": "frame", "id": "reg-email", "name": "Email Input", "clip": True, "width": 320, "height": 48, "fill": "$--input", "cornerRadius": 24, "stroke": {"align": "inside", "thickness": 1, "fill": "$--border"}, "padding": [0, 16], "justifyContent": "center", "children": [{"type": "text", "id": "reg-email-txt", "name": "Placeholder", "fill": "$--muted-foreground", "content": "seu@email.com", "fontSize": 14}]},
        {"type": "frame", "id": "reg-pass", "name": "Password Input", "clip": True, "width": 320, "height": 48, "fill": "$--input", "cornerRadius": 24, "stroke": {"align": "inside", "thickness": 1, "fill": "$--border"}, "padding": [0, 16], "justifyContent": "center", "children": [{"type": "text", "id": "reg-pass-txt", "name": "Placeholder", "fill": "$--muted-foreground", "content": "Senha", "fontSize": 14}]},
        {"type": "frame", "id": "reg-type", "name": "Type Selector", "clip": True, "width": 320, "height": 48, "fill": "$--input", "cornerRadius": 24, "stroke": {"align": "inside", "thickness": 1, "fill": "$--border"}, "padding": [0, 16], "justifyContent": "center", "children": [{"type": "text", "id": "reg-type-txt", "name": "Placeholder", "fill": "$--muted-foreground", "content": "Tipo de conta", "fontSize": 14}]},
        {"type": "frame", "id": "reg-btn", "name": "Register Button", "clip": True, "width": 320, "height": 48, "fill": "$--primary", "cornerRadius": 24, "padding": [0, 16], "justifyContent": "center", "alignItems": "center", "children": [{"type": "text", "id": "reg-btn-txt", "name": "Text", "fill": "$--primary-foreground", "content": "Criar conta", "fontSize": 16, "fontFamily": "$--font-secondary", "fontWeight": "600"}]},
    ]
}
screens_frame['children'].append(register_screen)

# Home screen (the main feed)
home_screen = {
    "type": "frame",
    "id": "screen-home",
    "x": 920,
    "y": 40,
    "name": "Home",
    "clip": True,
    "width": 390,
    "height": 844,
    "fill": "$--background",
    "layout": "vertical",
    "gap": 16,
    "padding": [0, 0],
    "children": [
        # TopBar
        {"type": "ref", "id": "home-topbar", "ref": "top-bar", "x": 0, "y": 0},
        # Search bar area
        {"type": "frame", "id": "home-searcharea", "name": "Search Area", "fill": [], "layout": "horizontal", "gap": 8, "padding": [0, 16], "alignItems": "center", "children": [
            {"type": "frame", "id": "home-search", "name": "Search Bar", "clip": True, "width": 358, "height": 40, "fill": "$--input", "cornerRadius": 20, "stroke": {"align": "inside", "thickness": 1, "fill": "$--border"}, "padding": [0, 16], "justifyContent": "center", "children": [{"type": "text", "id": "home-search-txt", "name": "Placeholder", "fill": "$--muted-foreground", "content": "Buscar produtos...", "fontSize": 14}]}
        ]},
        # Category filters
        {"type": "ref", "id": "home-cats", "ref": "category-filters", "x": 0, "y": 0},
        # Promocoes section
        {"type": "frame", "id": "home-promo", "name": "Promocoes Section", "fill": [], "layout": "vertical", "gap": 8, "padding": [0, 16], "children": [
            {"type": "frame", "id": "home-promo-header", "name": "Section Header", "fill": [], "layout": "horizontal", "gap": 8, "justifyContent": "space-between", "alignItems": "center", "children": [
                {"type": "text", "id": "home-promo-title", "name": "Title", "fill": "$--foreground", "content": "Promocoes", "fontSize": 18, "fontFamily": "$--font-primary", "fontWeight": "700"},
                {"type": "frame", "id": "home-promo-count", "name": "Count Badge", "clip": True, "width": 24, "height": 24, "fill": "$--color-warning", "cornerRadius": 12, "justifyContent": "center", "alignItems": "center", "children": [{"type": "text", "id": "home-promo-count-txt", "name": "Count", "fill": "$--color-warning-foreground", "content": "6", "fontSize": 12, "fontWeight": "700"}]}
            ]},
            # Horizontal scroll items
            {"type": "frame", "id": "home-promo-scroll", "name": "Horizontal Scroll", "fill": [], "layout": "horizontal", "gap": 12, "padding": [0, 0], "children": [
                {"type": "ref", "id": "home-promo-card1", "ref": "offer-card-h", "x": 0, "y": 0},
                {"type": "ref", "id": "home-promo-card2", "ref": "offer-card-h", "x": 188, "y": 0},
            ]}
        ]},
        # Ofertas section
        {"type": "frame", "id": "home-ofertas", "name": "Ofertas Section", "fill": [], "layout": "vertical", "gap": 12, "padding": [0, 16], "children": [
            {"type": "frame", "id": "home-ofertas-header", "name": "Section Header", "fill": [], "layout": "horizontal", "gap": 8, "justifyContent": "space-between", "alignItems": "center", "children": [
                {"type": "text", "id": "home-ofertas-title", "name": "Title", "fill": "$--foreground", "content": "Ofertas perto de voce", "fontSize": 18, "fontFamily": "$--font-primary", "fontWeight": "700"},
                {"type": "text", "id": "home-ofertas-count", "name": "Count", "fill": "$--muted-foreground", "content": "12 ofertas", "fontSize": 12, "fontFamily": "$--font-secondary", "fontWeight": "400"}
            ]},
            {"type": "ref", "id": "home-oferta1", "ref": "offer-card", "x": 0, "y": 0},
        ]},
        # Bottom nav
        {"type": "ref", "id": "home-bottomnav", "ref": "bottom-nav", "x": 0, "y": 780},
    ]
}
screens_frame['children'].append(home_screen)

# Search screen
search_screen = {
    "type": "frame",
    "id": "screen-search",
    "x": 1360,
    "y": 40,
    "name": "Search Results",
    "clip": True,
    "width": 390,
    "height": 844,
    "fill": "$--background",
    "layout": "vertical",
    "gap": 16,
    "padding": [0, 0],
    "children": [
        {"type": "ref", "id": "search-topbar", "ref": "top-bar", "x": 0, "y": 0},
        {"type": "frame", "id": "search-inputarea", "name": "Search Input", "fill": [], "layout": "horizontal", "gap": 8, "padding": [0, 16], "alignItems": "center", "children": [
            {"type": "frame", "id": "search-input", "name": "Search Bar", "clip": True, "width": 358, "height": 44, "fill": "$--input", "cornerRadius": 22, "stroke": {"align": "inside", "thickness": 1, "fill": "$--border"}, "padding": [0, 16], "justifyContent": "center", "children": [{"type": "text", "id": "search-input-txt", "name": "Text", "fill": "$--foreground", "content": "Leite integral", "fontSize": 14}]}
        ]},
        {"type": "frame", "id": "search-filters", "name": "Filter Pills", "fill": [], "layout": "horizontal", "gap": 8, "padding": [0, 16], "children": [
            {"type": "frame", "id": "sf-precobtn", "name": "Preco", "clip": True, "width": 80, "height": 32, "fill": "$--secondary", "cornerRadius": 9999, "padding": [0, 12], "justifyContent": "center", "alignItems": "center", "gap": 4, "children": [{"type": "text", "id": "sf-precotxt", "name": "Text", "fill": "$--foreground", "content": "Preco", "fontSize": 12, "fontWeight": "500"}]},
            {"type": "frame", "id": "sf-distbtn", "name": "Distancia", "clip": True, "width": 90, "height": 32, "fill": "$--secondary", "cornerRadius": 9999, "padding": [0, 12], "justifyContent": "center", "children": [{"type": "text", "id": "sf-disttxt", "name": "Text", "fill": "$--foreground", "content": "Distancia", "fontSize": 12, "fontWeight": "500"}]},
            {"type": "frame", "id": "sf-typebtn", "name": "Tipo", "clip": True, "width": 70, "height": 32, "fill": "$--secondary", "cornerRadius": 9999, "padding": [0, 12], "justifyContent": "center", "children": [{"type": "text", "id": "sf-typetxt", "name": "Text", "fill": "$--foreground", "content": "Tipo", "fontSize": 12, "fontWeight": "500"}]}
        ]},
        # Results list
        {"type": "frame", "id": "search-results", "name": "Results List", "fill": [], "layout": "vertical", "gap": 12, "padding": [0, 16], "children": [
            {"type": "ref", "id": "search-r1", "ref": "offer-card", "x": 0, "y": 0},
        ]},
        {"type": "ref", "id": "search-bn", "ref": "bottom-nav", "x": 0, "y": 780},
    ]
}
screens_frame['children'].append(search_screen)

# Product Detail screen
product_screen = {
    "type": "frame",
    "id": "screen-product",
    "x": 1800,
    "y": 40,
    "name": "Product Detail",
    "clip": True,
    "width": 390,
    "height": 844,
    "fill": "$--background",
    "layout": "vertical",
    "gap": 16,
    "padding": [0, 0],
    "children": [
        {"type": "text", "id": "prod-back", "name": "Back", "fill": "$--foreground", "content": "< Voltar", "fontSize": 14, "fontFamily": "$--font-secondary", "fontWeight": "500", "padding": [16, 16]},
        {"type": "frame", "id": "prod-image", "name": "Product Image", "clip": True, "width": 390, "height": 240, "fill": "$--secondary", "layout": "none"},
        {"type": "frame", "id": "prod-info", "name": "Product Info", "fill": [], "layout": "vertical", "gap": 8, "padding": [0, 16], "children": [
            {"type": "text", "id": "prod-name", "name": "Name", "fill": "$--foreground", "content": "Leite Integral 1L", "fontSize": 22, "fontFamily": "$--font-primary", "fontWeight": "700"},
            {"type": "frame", "id": "prod-barcode", "name": "Barcode", "fill": [], "layout": "horizontal", "gap": 8, "alignItems": "center", "children": [
                {"type": "text", "id": "prod-bc-label", "name": "Label", "fill": "$--muted-foreground", "content": "Codigo de barras:", "fontSize": 12},
                {"type": "text", "id": "prod-bc-code", "name": "Code", "fill": "$--muted-foreground", "content": "7891234560010", "fontSize": 12, "fontFamily": "monospace"}
            ]},
            {"type": "text", "id": "prod-avgprice", "name": "Avg Price", "fill": "$--muted-foreground", "content": "Preco medio: R$ 5,50", "fontSize": 13}
        ]},
        # Map placeholder
        {"type": "frame", "id": "prod-map", "name": "Map Placeholder", "clip": True, "width": 358, "height": 160, "fill": "$--secondary", "cornerRadius": 12, "justifyContent": "center", "alignItems": "center", "children": [{"type": "text", "id": "prod-map-txt", "name": "Map Text", "fill": "$--muted-foreground", "content": "Mapa de ofertas proximas", "fontSize": 14}]},
        # Offers list
        {"type": "frame", "id": "prod-offers", "name": "Offers Section", "fill": [], "layout": "vertical", "gap": 8, "padding": [0, 16], "children": [
            {"type": "text", "id": "prod-offers-title", "name": "Title", "fill": "$--foreground", "content": "Ofertas", "fontSize": 16, "fontFamily": "$--font-primary", "fontWeight": "700"}
        ]},
        {"type": "ref", "id": "prod-bn", "ref": "bottom-nav", "x": 0, "y": 780},
    ]
}
screens_frame['children'].append(product_screen)

# Scanner screen
scanner_screen = {
    "type": "frame",
    "id": "screen-scanner",
    "x": 2240,
    "y": 40,
    "name": "Scanner",
    "clip": True,
    "width": 390,
    "height": 844,
    "fill": "$--background",
    "layout": "vertical",
    "gap": 16,
    "padding": [0, 0],
    "children": [
        {"type": "text", "id": "scan-back", "name": "Back", "fill": "$--foreground", "content": "< Voltar", "fontSize": 14, "fontFamily": "$--font-secondary", "fontWeight": "500", "padding": [16, 16]},
        {"type": "frame", "id": "scan-camera", "name": "Camera View", "clip": True, "width": 390, "height": 400, "fill": "#000000", "layout": "none", "children": [
            # Corner brackets
            {"type": "rectangle", "id": "scan-corners", "name": "Scan Overlay", "fill": {"enabled": False}, "stroke": {"align": "inside", "thickness": 2, "fill": "$--primary"}, "width": 200, "height": 200, "x": 95, "y": 100},
            # Scanning line
            {"type": "rectangle", "id": "scan-line", "name": "Scan Line", "fill": "$--primary", "width": 160, "height": 2, "x": 115, "y": 200}
        ]},
        {"type": "frame", "id": "scan-result", "name": "Scan Result", "clip": True, "width": 358, "height": 80, "fill": "$--card", "cornerRadius": 12, "stroke": {"align": "inside", "thickness": 1, "fill": "$--border"}, "padding": [16, 16], "layout": "horizontal", "gap": 12, "alignItems": "center", "children": [
            {"type": "frame", "id": "scan-result-img", "name": "Product Image", "clip": True, "width": 48, "height": 48, "fill": "$--secondary", "cornerRadius": 8},
            {"type": "frame", "id": "scan-result-info", "name": "Info", "fill": [], "layout": "vertical", "gap": 4, "children": [
                {"type": "text", "id": "scan-result-name", "name": "Name", "fill": "$--foreground", "content": "Produto Escaneado", "fontSize": 14, "fontWeight": "600"},
                {"type": "text", "id": "scan-result-bc", "name": "Barcode", "fill": "$--muted-foreground", "content": "789...", "fontSize": 12}
            ]}
        ]},
        {"type": "text", "id": "scan-cta", "name": "CTA", "fill": "$--primary", "content": "Ver ofertas", "fontSize": 14, "fontWeight": "600", "textAlign": "center"},
    ]
}
screens_frame['children'].append(scanner_screen)

# Store Profile screen
store_screen = {
    "type": "frame",
    "id": "screen-store",
    "x": 40,
    "y": 940,
    "name": "Store Profile",
    "clip": True,
    "width": 390,
    "height": 844,
    "fill": "$--background",
    "layout": "vertical",
    "gap": 16,
    "padding": [0, 0],
    "children": [
        {"type": "text", "id": "store-back", "name": "Back", "fill": "$--foreground", "content": "< Voltar", "fontSize": 14, "fontFamily": "$--font-secondary", "fontWeight": "500", "padding": [16, 16]},
        {"type": "frame", "id": "store-header", "name": "Store Header", "fill": [], "layout": "horizontal", "gap": 12, "padding": [0, 16], "alignItems": "center", "children": [
            {"type": "frame", "id": "store-logo", "name": "Logo", "clip": True, "width": 64, "height": 64, "fill": "$--secondary", "cornerRadius": 32, "justifyContent": "center", "alignItems": "center", "children": [{"type": "text", "id": "store-logo-txt", "name": "Initials", "fill": "$--foreground", "content": "SM", "fontSize": 20, "fontWeight": "700"}]},
            {"type": "frame", "id": "store-info", "name": "Info", "fill": [], "layout": "vertical", "gap": 4, "children": [
                {"type": "text", "id": "store-name", "name": "Name", "fill": "$--foreground", "content": "Supermercado Modelo", "fontSize": 18, "fontWeight": "700"},
                {"type": "text", "id": "store-address", "name": "Address", "fill": "$--muted-foreground", "content": "Rua Exemplo, 123", "fontSize": 13}
            ]}
        ]},
        # Tabs for Ofertas / Promocoes
        {"type": "frame", "id": "store-tabs", "name": "Tabs", "clip": True, "width": 390, "height": 40, "fill": "$--background", "layout": "horizontal", "gap": 0, "children": [
            {"type": "frame", "id": "st-tab1", "name": "Ofertas Tab", "clip": True, "width": 195, "height": 40, "fill": [], "justifyContent": "center", "alignItems": "center", "children": [{"type": "text", "id": "st-tab1-txt", "name": "Text", "fill": "$--primary", "content": "Ofertas", "fontSize": 14, "fontWeight": "600"}]},
            {"type": "frame", "id": "st-tab2", "name": "Promocoes Tab", "clip": True, "width": 195, "height": 40, "fill": [], "justifyContent": "center", "alignItems": "center", "children": [{"type": "text", "id": "st-tab2-txt", "name": "Text", "fill": "$--muted-foreground", "content": "Promocoes", "fontSize": 14, "fontWeight": "400"}]}
        ]},
        # Offers list
        {"type": "frame", "id": "store-offers-list", "name": "Offers List", "fill": [], "layout": "vertical", "gap": 12, "padding": [0, 16], "children": [
            {"type": "ref", "id": "store-o1", "ref": "offer-card", "x": 0, "y": 0},
        ]},
    ]
}
screens_frame['children'].append(store_screen)

doc['children'].append(screens_frame)

# Write output
with open('C:/Garagem/Escritorios/PrecoReal/designs/precoreal.pen', 'w', encoding='utf-8') as f:
    # Write manually to handle problematic characters
    f.write(json.dumps(doc, ensure_ascii=True, indent=2))

print(f"Written {json.dumps(doc, ensure_ascii=False)}"[:200])
print("Done! File written to designs/precoreal.pen")
