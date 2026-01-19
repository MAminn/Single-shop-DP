# Single-Shop DB Bootstrap - Implementation Complete

**Date:** January 19, 2026  
**Status:** ✅ COMPLETE  
**Task:** Fix product creation FK constraint by ensuring default vendor row exists

---

## 🎯 Problem Solved

**Issue:** Product creation was failing because:

- `product.vendorId` references a foreign key constraint (`product_vendor_id_vendor_id_fk`)
- The vendor table existed but was empty
- Products could not be inserted without a valid vendor row

**Solution:** Created a bootstrap function that ensures a single default "store owner" vendor row exists at server startup.

---

## 📝 Files Changed

### 1. **Created: `shared/database/bootstrap.ts`** (New file)

Bootstrap function that:

- Reads the store owner ID from `shared/config/store.ts`
- Checks if vendor row exists
- Creates it if missing with minimal required fields

**Vendor Row Fields:**

```typescript
{
  id: "00000000-0000-0000-0000-000000000001",  // From getStoreOwnerId()
  name: "Store",
  status: "active",                           // Must be active (enum: pending|rejected|active|inactive|suspended|archived)
  description: "Default store owner (single-shop mode)",
  logoId: null,
  socialLinks: [],
  featured: false,
  createdAt: new Date(),
  updatedAt: new Date(),
}
```

### 2. **Modified: `server/server.ts`**

- **Line 13:** Added import: `import { ensureDefaultStoreVendor } from "#root/shared/database/bootstrap.js";`
- **Line 119:** Added bootstrap call after database registration:

  ```typescript
  await instance.register(drizzleFastifyPlugin);

  // Bootstrap: Ensure default store vendor exists (single-shop mode)
  await ensureDefaultStoreVendor();

  await instance.register(emailServiceMiddleware);
  ```

### 3. **Modified: `.env.example`**

- Added documentation for optional `STORE_OWNER_ID` environment variable
- Default value: `00000000-0000-0000-0000-000000000001`

---

## ✅ Verification

### Bootstrap Logs

```
[Bootstrap] Default store vendor already exists (id: 00000000-0000-0000-0000-000000000001)
Server running at http://localhost:3000
[INFO] Server listening at http://127.0.0.1:3000
```

### Server Startup

✅ Server starts successfully  
✅ Bootstrap function runs without errors  
✅ Detects existing vendor row (idempotent - safe to run multiple times)  
✅ Database FK constraint satisfied

---

## 🧪 Testing Product Creation

Now that the vendor row exists, product creation should work:

**Previous Error:**

```
ERROR: insert or update on table "product" violates foreign key constraint "product_vendor_id_vendor_id_fk"
DETAIL: Key (vendor_id)=(00000000-0000-0000-0000-000000000001) is not present in table "vendor".
```

**Expected Result:**
✅ Products can be created with `vendorId: getStoreOwnerId()`  
✅ No FK constraint violations  
✅ Single-shop mode operates normally

### Test Steps

1. Login as admin to dashboard
2. Navigate to Products → Create Product
3. Fill in product details
4. Submit form
5. **Verify:** Product is created successfully without FK errors

---

## 🔒 Important Notes

### This is NOT Multi-Vendor Behavior

- This is a **technical workaround** for database constraints only
- The vendor table still exists in the schema for FK integrity
- Only ONE vendor row exists (the default store)
- No vendor registration, approval, or management features
- No vendor UI or API endpoints
- All products belong to the single store

### Idempotent Design

- ✅ Safe to run multiple times (checks if row exists before inserting)
- ✅ Runs on every server startup
- ✅ No side effects if vendor row already present

### Environment Configuration

The store owner ID can be customized:

```bash
# .env (optional)
STORE_OWNER_ID=your-custom-uuid-here
```

If not set, defaults to: `00000000-0000-0000-0000-000000000001`

---

## 📊 Database State

**Vendor Table:**
| id | name | status | description |
|----|------|--------|-------------|
| 00000000-0000-0000-0000-000000000001 | Store | active | Default store owner (single-shop mode) |

**Product Table (Example after creation):**
| id | name | price | vendorId |
|----|------|-------|----------|
| uuid... | Sample Product | 99.99 | 00000000-0000-0000-0000-000000000001 |

---

## ✅ Success Criteria

All criteria met:

- [x] Bootstrap function created
- [x] Called during server startup after DB ready
- [x] Vendor row created with all required fields
- [x] Server starts without errors
- [x] Bootstrap is idempotent (safe to re-run)
- [x] No multi-vendor features reintroduced
- [x] FK constraint satisfied
- [x] Product creation ready to test

---

## 🚀 Next Steps

1. **Test Product Creation:**
   - Login to admin dashboard
   - Create a new product
   - Verify no FK constraint errors

2. **Test Order Creation:**
   - Place a test order
   - Verify orderItems with vendorId work correctly

3. **Verify No Vendor UI:**
   - Confirm no vendor pages/links visible
   - Dashboard shows no vendor management options

---

**Implementation Complete** ✅
