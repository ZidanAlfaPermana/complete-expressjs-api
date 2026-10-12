## Uji Skenario Payload

### 1. Nama terlalu pendek

`response:`

```json
[
  {
    "target": {
      "nama": "Bu",
      "sekolah": "SMKN 5 Malang",
      "email": "budi@gmail.com",
      "password": "rahasia123"
    },
    "value": "Bu",
    "property": "nama",
    "children": [],
    "constraints": {
      "minLength": "Nama minimal 3 karakter"
    }
  }
]
```
### 2. Email salah format

`response:`

```json
[
  {
    "target": {
      "nama": "Budi Agung",
      "sekolah": "SMKN 5 Malang",
      "email": "budi.gmail.com",
      "password": "rahasia123"
    },
    "value": "budi.gmail.com",
    "property": "email",
    "children": [],
    "constraints": {
      "isEmail": "Format email tidak valid"
    }
  }
]
```
### 3. Password tanpa angka

`response:`

```json
[
  {
    "target": {
      "nama": "Budi Agung",
      "sekolah": "SMKN 5 Malang",
      "email": "budi@gmail.com",
      "password": "rahasiaaku"
    },
    "value": "rahasiaaku",
    "property": "password",
    "children": [],
    "constraints": {
      "matches": "Password harus mengandung huruf dan angka"
    }
  }
]
```
### 4. ada properti tambahan { "role": "mentor" }

`response:`

```json
[
  {
    "target": {
      "nama": "Budi Agung",
      "sekolah": "SMKN 5 Malang",
      "email": "budi@gmail.com",
      "password": "rahasia123",
      "role": "mentor"
    },
    "value": "mentor",
    "property": "role",
    "constraints": {
      "whitelistValidation": "property role should not exist"
    }
  }
]
```
### 5. Valid sempurna

`response:`

```json
[]
```