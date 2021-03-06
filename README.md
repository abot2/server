# Сервис копирования сигналов бинарных опционов

В данном репозитории находится серверная часть, отвечающая за прием сигналов со стороны торговых терминалов и отправляющая сигналы локальным ботам.

## Установка, сборка и запуск

### Windows

1. Установить Node.js последней версии (включая npm).

1. Установить MongoDB последней версии.

1. С помощью MongoDB Compass Community создать БД `autobot` и создать в этой БД коллекцию `signal_source` с документами необходимой структуры (описано [ниже](#signal_source_struct)). Важно сделать это до запуска сервера, иначе он не запустится.

1. Прописать полный путь к `mongod` в файле `rundb.bat`.

1. Выполнить `npm i`.

1. Запустить `rundb.bat` (стартует Mongo).

1. Запустить `mongo` shell и выполнить команду `rs.initiate()`.

1. Запустить `run.bat` (стартует сервер).

Так сложно только при первом запуске. В дальнейшем достаточно будет запускать только `rundb.bat` и `run.bat`.

### Linux

Инструкция будет позже.

## <a name="signal_source_struct"></a>Структура документа в коллекции signal_source

Пример одного документа:

```json
{
  "_id" : "автоматически присвоенный id",
  "ip" : "192.168.10.104",
  "port" : 60001,
  "pwdhash" : "202cb962ac59075b964b07152d234b70"
}
```

Каждый такой документ описывает отдельный источник сигнала (терминал), с которого придет торговый сигнал. Это необходимо для безопасного приема сигнала, когда мы можем проверить IP-адрес источника, локальный UDP-порт и MD5-хэш пароля.

* __ip__ - это IPv4-адрес терминала, с которого может прийти сигнал.
* __port__ - это локальный UDP-порт, на который придет сигнал с данного IPv4.
* __pwdhash__ - это MD5-хэш пароля, который придет в JSON-сообщении о сигнале.
