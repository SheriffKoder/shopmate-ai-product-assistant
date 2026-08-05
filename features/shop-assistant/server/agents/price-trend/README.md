# Price Trend Agent

Handles development price-history questions such as “How has the price of X changed over the past years?”.

The current catalog has no historical price table, so this agent uses a deterministic mock history based on the current catalog price. It creates a `chart` document through the assistant artifact pipeline. Replace `mockHistory` with a catalog history/repository query when historical pricing is available.
