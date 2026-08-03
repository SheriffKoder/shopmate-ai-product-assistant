# Shop Assistant

ShopMate-specific adapter for the reusable AI assistant feature.

This package owns the electronics catalog prompts, product/cart tools, ShopMate agent routing, and product/cart tool renderers. The reusable assistant core imports only generic contracts from `features/ai-assistant`; app entry points inject this adapter where ShopMate behavior is needed.
