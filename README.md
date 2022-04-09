# ped
Pali English Dictionary in offtext format

## prerequisite
download https://github.com/suttacentral/sc-data/dictionaries/complex/pli2en-pts.json

## TODO

去除重覆的釋文 如 Māsati, Māsana, Māsin 重覆三次，去掉後兩個釋文改為指針。

Akkhi   釋文中 añjan˚  展開為 añjanakkhi

建立拓展詞表

到cs搜尋出處，改為更精確的位置。
sc@ 是 sc 的地址 (83186個)。pts@ 是 pts 頁碼(44346個，暫不處理)。

## build steps

    node gen.js
    pitaka build
    mklink/j ../accelon2021/public/ped ./ped

