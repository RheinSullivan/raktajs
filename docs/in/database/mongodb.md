# Integrasi MongoDB

MongoDB adalah database dokumen NoSQL populer untuk menyimpan data terstruktur fleksibel berformat JSON/BSON.

## Penggunaan CLI
```bash
bun create rakta aplikasi-saya --fullstack --database=mongodb
```

## Contoh Penggunaan Mongoose / MongoDB Client
```typescript
import mongoose from "mongoose";

await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/rakta");
```
