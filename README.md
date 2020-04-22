# 使用準備
## node.jsのインストール
[こちら](https://nodejs.org/ja/)からダウンロードできます。  
推奨版が好ましいです。

## このリポジトリをClone
リポジトリのアドレスは右上あたりにあるはずです
一応以下になります。  
Cloneしたくない人は[こちら](https://github.com/kohshi-nozawa/image-optimize/archive/master.zip)からダウンロードしてもいいです。
```https://github.com/kohshi-nozawa/image-optimize.git```

## パッケージのインストール
Cloneしたリポジトリのディレクトリ配下で以下のコマンドを実行
```
npm i -D
```

# 使用方法
## srcImage配下にjpgもしくはpngを配置
ファイルをそのまま置いても、ディレクトリにしてまとめても両方実行可能です。

## 実行コマンドの入力
以下で実行
```
npx gulp
```

もしくは、下記を実行しておくとsrcImage配下の変更を自動で検知して実行してくれます。
```
npx gulp watch
```

僕は両方うつのめんどくさいんでエイリアスにして登録しちゃってます。

## distImage配下に圧縮後のファイルが出力される
ファイル名、ディレクトリ構造はそのままで出力されます。
