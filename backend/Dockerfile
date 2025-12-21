FROM ruby:3.2.4

RUN apt-get update -qq && apt-get install -y \
    build-essential \
    libpq-dev \
    nodejs \
    yarn \
    imagemagick \
    vim \
    default-mysql-client \
    default-libmysqlclient-dev

WORKDIR /app

# Gemfileをコピー
COPY Gemfile* ./

# 依存関係をインストール
RUN bundle install

# アプリケーションコードをコピー
COPY . .

EXPOSE 3000

CMD ["rails", "server", "-b", "0.0.0.0"]