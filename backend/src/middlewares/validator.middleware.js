export const validateSchema = (schema) => (req, res, next) => {
        try {
                schema.parse(req.body);
                next();
        } catch (error) {
                return res.status(400).json({ error });
        }
};

// Alias para compatibilidad con imports existentes
export { validateSchema as validate };