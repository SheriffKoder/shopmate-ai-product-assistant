# Shadow Architecture

Parallel server-first implementation for the migration phase. Shadow files should not import current `features`, `components`, or `lib` app modules unless a migration step explicitly says to copy and rewrite a file.
