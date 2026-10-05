# Imagens de categorias e cena 3D da Home

O admin em `/admin/categorias` permite enviar/trocar/remover uma foto de cada categoria com produtos públicos. Usa a identidade ERP exata; não edita nomes, produtos nem visibilidade. Home e categorias usam o mesmo `imageUrl`, com recorte `object-cover`. Na ausência da imagem personalizada, permanecem os assets atuais ou o placeholder.

## Backend necessário

- GET /api/admin/category-images
- PUT /api/admin/category-images?erpName=... (multipart, campo file)
- DELETE /api/admin/category-images?erpName=...

Todas as operações exigem sessão Spring; PUT/DELETE exigem CSRF dinâmico. JPEG/PNG/WEBP, até 5 MB, com validação de conteúdo no servidor. R2 é acessado apenas pelo backend.

A API pública de categorias recebe o campo nullable `imageUrl`. O cliente continua compatível com a versão antiga sem esse campo. Para uso publicado, implantar o backend com V7 antes do frontend. O servidor atual sem esse recurso retorna indisponibilidade controlada.

## Animação

A Home utiliza WebGL nativo, sem dependência nova ou vídeo pesado: três tubos 3D com profundidade, iluminação, movimento e cores personalizáveis. A malha é compartilhada e criada uma vez. Limite de 30 fps e DPR 1,5; pausa fora da tela/aba inativa. Reduced motion apresenta pose estática. WebGL indisponível mantém a foto existente de cabos.

O mouse/toque altera a orientação 3D; as setas do teclado também permitem explorar a perspectiva. Cada cabo tem um seletor de cor independente (somente estado local da cena). Um botão permite pausar/retomar o movimento. As cores escolhidas não são sobrescritas pela animação.
