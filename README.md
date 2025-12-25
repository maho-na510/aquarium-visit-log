# Aquarium Visit Log
# 水族館訪問記録アプリ

全国の水族館への訪問を記録・管理するフルスタックWebアプリケーション。訪問記録の作成、水族館の評価、写真のアップロード、行きたいリストの作成、インタラクティブマップでの水族館探索が可能です。

## 主な機能

- ユーザー認証（登録、ログイン、ログアウト）
- ユーザーの権限によって機能を制限
- 詳細な水族館データベース
- 評価・コメント・写真付きの訪問記録
- 優先度とメモ付きの行きたいリスト
- カスタマイズ可能なマーカー付きインタラクティブマップ
- ランキング機能（訪問数、評価、トレンド、行きたいリストチャンピオン、隠れた名所）
- 都道府県フィルタリング・ソート機能
- ヘッダー写真選択機能付きフォトギャラリー
- モバイル・デスクトップ対応レスポンシブデザイン

## Tech Stack

### Backend
- Ruby 3.2.4
- Rails 7.1.5
- MySQL 8.0
- Active Storage (for file uploads)
- Devise (for authentication)
- Kaminari (for pagination)
- Geocoder (for location-based features)

### Frontend
- React 19.1.0
- TypeScript 4.9.5
- Material-UI (MUI) 7.2.0
- React Router 6.30.1
- TanStack Query 5.81.5
- Leaflet & React Leaflet (for maps)
- Axios (for API calls)
- React Hook Form (for form handling)

### Infrastructure
- Docker & Docker Compose
- MySQL 8.0

## Prerequisites

- Docker
- Docker Compose

以上.その他の依存関係はすべてDockerコンテナ内で管理されます。

## セットアップ手順

### 1. Clone the repository

```bash
git clone https://github.com/maho-na510/aquarium-visit-log.git
cd aquarium-visit-log
```

### 2. Start the application

```bash
docker compose up
```

This command will:
- Build the backend and frontend containers
- Start the MySQL database
- Install all dependencies
- Start the development servers


### 3. Set up the database

In a new terminal window, run:

```bash
# Create the database
docker compose exec backend rails db:create

# Run migrations
docker compose exec backend rails db:migrate

# (Optional) Load seed data
docker compose exec backend rails db:seed
```

### 4. Access the application

- Frontend: http://localhost:3001
- Backend API: http://localhost:3000
- MySQL: localhost:3306

## Default Ports

| Service  | Port |
|----------|------|
| Frontend | 3001 |
| Backend  | 3000 |
| MySQL    | 3306 |

## Environment Variables

### Backend

The backend uses the following environment variables (configured in docker-compose.yml):

- `DATABASE_HOST=db`
- `DATABASE_USER=aquarium_user`
- `DATABASE_PASSWORD=aquarium_password`
- `RAILS_ENV=development`

### Frontend

The frontend uses:

- `REACT_APP_API_URL=http://localhost:3000`
- `CHOKIDAR_USEPOLLING=true` (for hot-reload in Docker)

## Database Configuration

MySQL credentials (defined in docker-compose.yml):

- Root password: `root_password`
- Database: `aquarium_visit_log_development`
- User: `aquarium_user`
- Password: `aquarium_password`

## Development

### Running commands in containers

```bash
# Backend (Rails)
docker compose exec backend bash
docker compose exec backend rails console
docker compose exec backend rails db:migrate

# Frontend (React)
docker compose exec frontend bash
docker compose exec frontend npm install <package>
```

### Stopping the application

```bash
docker compose down
```

### Rebuilding containers

Dockerfileや依存関係を変更した場合：

```bash
docker compose down
docker compose build
docker compose up
```

### Viewing logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db
```

## Common Tasks

### Creating a new migration

```bash
docker compose exec backend rails generate migration MigrationName
docker compose exec backend rails db:migrate
```

### Installing new dependencies

```bash
# Backend (Gemfile)
docker compose exec backend bundle install

# Frontend (package.json)
docker compose exec frontend npm install
```

### Resetting the database

```bash
docker compose exec backend rails db:drop db:create db:migrate db:seed
```

### Running tests

```bash
# Backend
docker compose exec backend rails test

# Frontend
docker compose exec frontend npm test
```

## Project Structure

```
aquarium-visit-log/
├── backend/              # Rails API backend
│   ├── app/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── serializers/
│   │   └── services/
│   ├── config/
│   ├── db/
│   └── Gemfile
├── frontend/            # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── types/
│   └── package.json
├── mysql/               # MySQL configuration
│   └── my.cnf
└── docker-compose.yml   # Docker orchestration
```

## API Endpoints

### Authentication
- `POST /api/v1/users` - Register
- `POST /api/v1/sessions` - Login
- `DELETE /api/v1/sessions` - Logout
- `GET /api/v1/users/me` - Get current user

### Aquariums
- `GET /api/v1/aquariums` - List aquariums
- `GET /api/v1/aquariums/:id` - Get aquarium details
- `POST /api/v1/aquariums` - Create aquarium (admin)
- `PATCH /api/v1/aquariums/:id` - Update aquarium (admin)
- `DELETE /api/v1/aquariums/:id` - Delete aquarium (admin)
- `GET /api/v1/aquariums/search` - Search aquariums
- `GET /api/v1/aquariums/nearby` - Find nearby aquariums

### Visits
- `GET /api/v1/visits` - List user's visits
- `POST /api/v1/visits` - Create visit
- `PATCH /api/v1/visits/:id` - Update visit
- `DELETE /api/v1/visits/:id` - Delete visit

### Wishlist
- `GET /api/v1/wishlist_items` - List wishlist items
- `POST /api/v1/wishlist_items` - Add to wishlist
- `PATCH /api/v1/wishlist_items/:id` - Update wishlist item
- `DELETE /api/v1/wishlist_items/:id` - Remove from wishlist

### Rankings
- `GET /api/v1/rankings/most_visited` - Most visited aquariums
- `GET /api/v1/rankings/highest_rated` - Highest rated aquariums

## トラブルシューティング

### ポートが既に使用されている

「ポートが既に使用されています」エラーが表示された場合：
- 競合しているサービスを停止する
- docker-compose.ymlでポートを変更する

### データベース接続エラー

```bash
# MySQLの起動を待ってから実行
docker compose exec backend rails db:create db:migrate
```

### フロントエンドのホットリロードが動作しない

`CHOKIDAR_USEPOLLING=true`環境変数で対処されるはずです。
問題が続く場合：

```bash
docker compose down
docker compose up
```

### volumesの権限エラー

```bash
# Linux/Macで適切な権限を確保する
sudo chown -R $USER:$USER .
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

