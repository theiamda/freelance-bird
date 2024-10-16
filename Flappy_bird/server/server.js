const express = require("express");
const TelegramBot = require("node-telegram-bot-api");
const db = require("./db");
const cors = require("cors");
const NodeCache = require("node-cache");

const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json()); // Добавьте это для обработки JSON в теле запроса

const token = "7550106913:AAHQRaBg_bUnsRRFmY53F0txuT22bNqRCPw"; // Замените на токен вашего бота
const bot = new TelegramBot(token, { polling: true });

// Инициализация кэша с временем жизни 1 день (86400 секунд)
const myCache = new NodeCache({ stdTTL: 86400 });

const weekCache = new NodeCache({ stdTTL: 604800 });

let userName = "";
let chatid = null;
const admin = "iamdanyay";

let appUser = "";

// Функция для проверки кэша и обновления его из базы данных
const checkCacheAndUpdate = (chatId) => {
  const userCacheKey = chatId.toString();
  let cachedUser = myCache.get(userCacheKey);
  let cachedUserWeek = weekCache.get(userCacheKey);

  if (!cachedUser) {
    console.log(
      chatId,
      "Пользователь не найден в кэше, запрашиваем базу данных"
    );

    // Запрос к базе данных
    db.get("SELECT * FROM users WHERE id = ?", [chatId], (err, row) => {
      if (err) {
        console.error(err.message);
        return;
      }

      if (row) {
        // Пользователь найден в базе данных
        myCache.set(userCacheKey, {
          id: chatId,
          username: row.username,
          score: row.score || 0,
        });
        console.log(chatId, "Пользователь добавлен в кэш");
      } else {
        console.log(chatId, "Пользователь не найден в базе данных");
      }
    });
  } else {
    console.log(chatId, "Пользователь найден в кэше");
  }

  if (!cachedUserWeek) {
    console.log(
      chatId,
      "Пользователь не найден в кэше, запрашиваем базу данных"
    );

    // Запрос к базе данных
    db.get("SELECT * FROM users WHERE id = ?", [chatId], (err, row) => {
      if (err) {
        console.error(err.message);
        return;
      }

      if (row) {
        // Пользователь найден в базе данных
        weekCache.set(userCacheKey, {
          id: chatId,
          username: row.username,
          score: row.score || 0,
        });
        console.log(chatId, "Пользователь добавлен в кэш");
      } else {
        console.log(chatId, "Пользователь не найден в базе данных");
      }
    });
  } else {
    console.log(chatId, "Пользователь найден в кэше");
  }
};

// Обработка команды /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from.username;

  userName = username;
  chatid = chatId;

  const webAppUrl = "https://670e-95-25-52-87.ngrok-free.app";

  bot.sendMessage(chatId, "goodie", {
    reply_markup: {
      inline_keyboard: [[{ text: "Goodie", web_app: { url: webAppUrl } }]],
    },
  });

  // Проверяем, существует ли пользователь в базе данных
  db.get("SELECT * FROM users WHERE id = ?", [chatId], (err, row) => {
    if (err) {
      console.error(err.message);
      bot.sendMessage(chatId, "Произошла ошибка при проверке данных.");
      return;
    }

    if (row) {
      // Проверяем, существует ли пользователь в кэше
      if (myCache.has(chatId.toString())) {
        console.log(chatId, "Пользователь уже существует");
      } else {
        // Сохраняем нового пользователя в кэше
        const newUser = { id: chatId, username, score: 0 }; // Инициализируем очки
        myCache.set(chatId.toString(), newUser);
      }
      // Проверяем, существует ли пользователь в кэше
      if (weekCache.has(chatId.toString())) {
        console.log(chatId, "Пользователь уже существует");
      } else {
        // Сохраняем нового пользователя в кэше
        const newUser = { id: chatId, username, score: 0 }; // Инициализируем очки
        weekCache.set(chatId.toString(), newUser);
      }
      bot.sendMessage(chatId, "Пользователь уже существует");
    } else {
      db.run(
        "INSERT INTO users (id, username) VALUES (?, ?)",
        [chatId, username],
        (err) => {
          if (err) {
            console.error(err.message);
            bot.sendMessage(chatId, "Произошла ошибка при сохранении данных.");
          } else {
            // Проверяем, существует ли пользователь в кэше
            if (myCache.has(chatId.toString())) {
              console.log("Пользователь уже существует");
            } else {
              // Сохраняем нового пользователя в кэше
              const newUser = { id: chatId, username, score: 0 }; // Инициализируем очки
              myCache.set(chatId.toString(), newUser);
            }
            // Проверяем, существует ли пользователь в кэше
            if (weekCache.has(chatId.toString())) {
              console.log(chatId, "Пользователь уже существует");
            } else {
              // Сохраняем нового пользователя в кэше
              const newUser = { id: chatId, username, score: 0 }; // Инициализируем очки
              weekCache.set(chatId.toString(), newUser);
            }
            bot.sendMessage(chatId, `Привет, ${username}! Ваш ID сохранен.`);
          }
        }
      );
    }
  });

  setInterval(() => {
    // Проверяем кэш при старте
    checkCacheAndUpdate(chatId);
  
    // Устанавливаем интервал для проверки кэша каждые 6 минут
    setInterval(() => {
      checkCacheAndUpdate(chatId);
    }, 60000); // 6 минут секунд
  }, 60000);

  if (username == admin) {
    bot.sendMessage(
      chatId,
      'Вы были авторизованы как админ! Чтобы выдать вещи пользователю введите "/give *имя юзера* "'
    );
  }
});

bot.onText(/\/give (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const usernameToCheck = match[1]; // Получаем имя пользователя из команды

  chatid = chatId

  appUser = usernameToCheck;

  if (userName == admin) {
    // Проверяем существование username в базе данных
    db.get(
      "SELECT * FROM users WHERE username = ?",
      [usernameToCheck],
      (err, row) => {
        if (err) {
          console.error(err.message);
          bot.sendMessage(chatId, "Произошла ошибка при проверке данных.");
          return;
        }

        if (row) {
          // Пользователь найден в базе данных
          bot.sendMessage(
            chatId,
            `Пользователь ${usernameToCheck} найден. Введите название предмета, который вы хотите выдать юзеру: \n /getoneheart, /getfiveheart, /getbluebird, /getpinkbird, /getbackground`
          );
        } else {
          // Пользователь не найден в базе данных
          bot.sendMessage(chatId, `Пользователь ${usernameToCheck} не найден.`);
        }
      }
    );
  } else {
    bot.sendMessage(chatId, "У вас недостаточно прав :(");
  }
});

bot.onText(/\/getoneheart/, (msg) => {
  const chatId = msg.chat.id;

  chatid = chatId

  if (userName == admin) {
    // Пользователь найден, обновляем данные
    db.run(
      "UPDATE users SET heartone = heartone + ? WHERE username = ?",
      [1, appUser],
      function (err) {
        if (err) {
          console.error(err.message);
          bot.sendMessage(chatId, "Произошла ошибка при обновлении данных.");
        } else {
          bot.sendMessage(chatId, `Данные пользователя ${appUser} обновлены.`);
        }
      }
    );
  } else {
    bot.sendMessage(chatId, "у вас недостаточно прав :(");
  }
});

bot.onText(/\/getfiveheart/, (msg) => {
  const chatId = msg.chat.id;

  if (userName == admin) {
    // Пользователь найден, обновляем данные
    db.run(
      "UPDATE users SET hearttwo = hearttwo + ? WHERE username = ?",
      [5, appUser],
      function (err) {
        if (err) {
          console.error(err.message);
          bot.sendMessage(chatId, "Произошла ошибка при обновлении данных.");
        } else {
          bot.sendMessage(chatId, `Данные пользователя ${appUser} обновлены.`);
        }
      }
    );
  } else {
    bot.sendMessage(chatId, "у вас недостаточно прав :(");
  }
});

bot.onText(/\/getbluebird/, (msg) => {
  const chatId = msg.chat.id;

  if (userName == admin) {
    // Пользователь найден, обновляем данные
    db.run(
      "UPDATE users SET birdone = ? WHERE username = ?",
      [1, appUser],
      function (err) {
        if (err) {
          console.error(err.message);
          bot.sendMessage(chatId, "Произошла ошибка при обновлении данных.");
        } else {
          bot.sendMessage(chatId, `Данные пользователя ${appUser} обновлены.`);
        }
      }
    );
  } else {
    bot.sendMessage(chatId, "у вас недостаточно прав :(");
  }
});

bot.onText(/\/getpinkbird/, (msg) => {
  const chatId = msg.chat.id;

  if (userName == admin) {
    // Пользователь найден, обновляем данные
    db.run(
      "UPDATE users SET birdtwo = ? WHERE username = ?",
      [1, appUser],
      function (err) {
        if (err) {
          console.error(err.message);
          bot.sendMessage(chatId, "Произошла ошибка при обновлении данных.");
        } else {
          bot.sendMessage(chatId, `Данные пользователя ${appUser} обновлены.`);
        }
      }
    );
  } else {
    bot.sendMessage(chatId, "у вас недостаточно прав :(");
  }
});

bot.onText(/\/getbackground/, (msg) => {
  const chatId = msg.chat.id;

  if (userName == admin) {
    // Пользователь найден, обновляем данные
    db.run(
      "UPDATE users SET back = ? WHERE username = ?",
      [1, appUser],
      function (err) {
        if (err) {
          console.error(err.message);
          bot.sendMessage(chatId, "Произошла ошибка при обновлении данных.");
        } else {
          bot.sendMessage(chatId, `Данные пользователя ${appUser} обновлены.`);
        }
      }
    );
  } else {
    bot.sendMessage(chatId, "у вас недостаточно прав :(");
  }
});

app.get("/data", (req, res) => {
  const users = Object.values(myCache.keys()).map((key) => myCache.get(key));

  if (users.length > 0) {
    const sortedUsers = users.sort((a, b) => b.score - a.score).slice(0, 20);
    res.json(sortedUsers); // Отправляем данные пользователей
  } else {
    res.status(404).json({ error: "Пользователи не найдены" });
  }
});

app.get("/dataweek", (req, res) => {
  const users = Object.values(weekCache.keys()).map((key) =>
    weekCache.get(key)
  );

  if (users.length > 0) {
    const sortedUsers = users.sort((a, b) => b.score - a.score).slice(0, 20);
    res.json(sortedUsers); // Отправляем данные пользователей
  } else {
    res.status(404).json({ error: "Пользователи не найдены" });
  }
});

// Обновление очков
app.post("/updateScore", async (req, res) => {
  const { score } = req.body;

  if (!myCache.has(chatid.toString())) {
    return res.status(404).json({ error: "Пользователь не найден" });
  }

  // Обновляем очки в кэше
  const userData = myCache.get(chatid.toString());

  if (userData.score < score) {
    userData.score = score; // Увеличиваем очки
    myCache.set(chatid.toString(), userData);
  }

  res.json({ message: "Score updated successfully!", score: userData.score });
});

// Обновление очков
app.post("/updateScoreweek", async (req, res) => {
  const { score } = req.body;

  if (!weekCache.has(chatid.toString())) {
    return res.status(404).json({ error: "Пользователь не найден" });
  }

  // Обновляем очки в кэше
  const userData = weekCache.get(chatid.toString());

  if (userData.score < score) {
    userData.score = score; // Увеличиваем очки
    weekCache.set(chatid.toString(), userData);
  }

  res.json({ message: "Score updated successfully!", score: userData.score });
});

app.post("/arise", (req, res) => {

    const chatId = req.body.chatId;

    db.run(
        "UPDATE users SET heartone = heartone - 1 WHERE id = ?",
        [chatId],
        function (err) {
            if (err) {
                return res.status(500).json({ message: "Error updating." });
            }
            res.json({ message: "Score updated successfully!" });
        }
    );
});



app.post("/create-invoiceo", async (req, res) => {
  const chatId = req.body.chatId;

  if (!chatId) {
    return res
      .status(400)
      .send({ success: false, error: "chatId is required" });
  }

  const invoiceData = {
    chat_id: chatId,
    title: "Flappy-bird",
    description: "Заплатите 100 звёзд",
    payload: "STARPAYLOAD",
    provider_token: "",
    start_parameter: "star",
    currency: "XTR",
    prices: [{ label: "star", amount: 100 }],
  };

  try {
    // Create an invoice link instead of sending it
    const invoiceLink = await createInvoiceLink(invoiceData); // Implement this function to generate the link
    res.json({ invoiceLink });
  } catch (error) {
    console.error("Error sending invoice:", error);
  }
});

app.post("/create-invoice", async (req, res) => {
  const chatId = req.body.chatId;

  if (!chatId) {
    return res
      .status(400)
      .send({ success: false, error: "chatId is required" });
  }

  const invoiceData = {
    chat_id: chatId,
    title: "Flappy-bird",
    description: "Заплатите 50 звёзд",
    payload: "STAR_PAYLOAD",
    provider_token: "",
    start_parameter: "star",
    currency: "XTR",
    prices: [{ label: "star", amount: 50 }],
  };

  try {
    // Create an invoice link instead of sending it
    const invoiceLink = await createInvoiceLink(invoiceData); // Implement this function to generate the link
    res.json({ invoiceLink });
  } catch (error) {
    console.error("Error sending invoice:", error);
  }
});

async function createInvoiceLink(invoiceData) {
  const response = await axios.post(
    `https://api.telegram.org/bot${token}/createInvoiceLink`,
    invoiceData
  );
  return response.data.result; // Adjust based on actual API response structure
}

// Обработка успешной оплаты
bot.on("pre_checkout_query", (query) => {
  bot.answerPreCheckoutQuery(query.id, true);
});

let isPaid = [];

// Обработка успешного завершения оплаты
bot.on("successful_payment", async (msg) => {
  if (isPaid.includes("birdone")) {
    const birdone = {
      birdone: 1,
    };

    // Получаем chatId
    const chatId = msg.chat.id;

    try {
      // Отправляем POST-запрос на обновление данных
      await axios.post("http://localhost:3000/updateBirdone", {
        birdone,
        chatId,
      });

      // Отправляем сообщение пользователю
      bot.sendMessage(
        chatId,
        "Спасибо за вашу поддержку! Вы успешно оплатили Telegram Stars."
      );
    } catch (error) {
      console.error("Ошибка при обновлении данных:", error.message);
      bot.sendMessage(chatId, "Произошла ошибка при обработке вашего платежа.");
    }
  }

  if (isPaid.includes("birdtwo")) {
    const birdtwo = {
      birdtwo: 1,
    };

    // Получаем chatId
    const chatId = msg.chat.id;

    try {
      // Отправляем POST-запрос на обновление данных
      await axios.post("http://localhost:3000/updateBirdtwo", {
        birdtwo,
        chatId,
      });

      // Отправляем сообщение пользователю
      bot.sendMessage(
        chatId,
        "Спасибо за вашу поддержку! Вы успешно оплатили Telegram Stars."
      );
    } catch (error) {
      console.error("Ошибка при обновлении данных:", error.message);
      bot.sendMessage(chatId, "Произошла ошибка при обработке вашего платежа.");
    }
  }

  if (isPaid.includes("back")) {
    const back = {
      back: 1,
    };

    // Получаем chatId
    const chatId = msg.chat.id;

    try {
      // Отправляем POST-запрос на обновление данных
      await axios.post("http://localhost:3000/updateBack", { back, chatId });

      // Отправляем сообщение пользователю
      bot.sendMessage(
        chatId,
        "Спасибо за вашу поддержку! Вы успешно оплатили Telegram Stars."
      );
    } catch (error) {
      console.error("Ошибка при обновлении данных:", error.message);
      bot.sendMessage(chatId, "Произошла ошибка при обработке вашего платежа.");
    }
  }

  if (isPaid.includes("heartone")) {
    const heartone = {
      heartone: 1,
    };

    // Получаем chatId
    const chatId = msg.chat.id;

    try {
      // Отправляем POST-запрос на обновление данных
      await axios.post("http://localhost:3000/updateHeartone", {
        heartone,
        chatId,
      });

      // Отправляем сообщение пользователю
      bot.sendMessage(
        chatId,
        "Спасибо за вашу поддержку! Вы успешно оплатили Telegram Stars."
      );
    } catch (error) {
      console.error("Ошибка при обновлении данных:", error.message);
      bot.sendMessage(chatId, "Произошла ошибка при обработке вашего платежа.");
    }
  }

  if (isPaid.includes("hearttwo")) {
    const hearttwo = {
      hearttwo: 5,
    };

    // Получаем chatId
    const chatId = msg.chat.id;

    try {
      // Отправляем POST-запрос на обновление данных
      await axios.post("http://localhost:3000/updateHearttwo", {
        hearttwo,
        chatId,
      });

      // Отправляем сообщение пользователю
      bot.sendMessage(
        chatId,
        "Спасибо за вашу поддержку! Вы успешно оплатили Telegram Stars."
      );
    } catch (error) {
      console.error("Ошибка при обновлении данных:", error.message);
      bot.sendMessage(chatId, "Произошла ошибка при обработке вашего платежа.");
    }
  }
});

app.post("/updateBirdone", async (req, res) => {
  const { birdone, chatId } = req.body; // Извлекаем данные из тела запроса

  db.run(
    "UPDATE users SET birdone = ? WHERE id = ?",
    [birdone, chatId],
    function (err) {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ error: "Ошибка при обновлении данных" });
      }
      res.json({ message: "Данные успешно обновлены!" });
    }
  );
});

app.post("/updateHeartone", async (req, res) => {
  const { heartone, chatId } = req.body; // Извлекаем данные из тела запроса

  db.run(
    "UPDATE users SET heartone = heartone + 1 WHERE id = ?",
    [chatId],
    function (err) {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ error: "Ошибка при обновлении данных" });
      }
      res.json({ message: "Данные успешно обновлены!" });
    }
  );
});

app.post("/updateBirdtwo", async (req, res) => {
  const { birdtwo, chatId } = req.body; // Извлекаем данные из тела запроса

  db.run(
    "UPDATE users SET birdtwo = ? WHERE id = ?",
    [birdtwo, chatId],
    function (err) {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ error: "Ошибка при обновлении данных" });
      }
      res.json({ message: "Данные успешно обновлены!" });
    }
  );
});

app.post("/updateHearttwo", async (req, res) => {
  const { hearttwo, chatId } = req.body; // Извлекаем данные из тела запроса

  db.run(
    "UPDATE users SET hearttwo = hearttwo + 5 WHERE id = ?",
    [chatId],
    function (err) {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ error: "Ошибка при обновлении данных" });
      }
      res.json({ message: "Данные успешно обновлены!" });
    }
  );
});

app.post("/updateBack", async (req, res) => {
  const { back, chatId } = req.body; // Извлекаем данные из тела запроса

  db.run(
    "UPDATE users SET back = ? WHERE id = ?",
    [back, chatId],
    function (err) {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ error: "Ошибка при обновлении данных" });
      }
      res.json({ message: "Данные успешно обновлены!" });
    }
  );
});

// Получение данных пользователя
app.get("/dataall", (req, res) => {
  db.get("SELECT * FROM users WHERE id = ?", [chatid], (err, row) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: "Ошибка при получении данных" });
    }
    if (row) {
      res.json(row); // Отправляем данные конкретного пользователя
    } else {
      res.status(404).json({ error: "Пользователь не найден" });
    }
  });
});

app.get("/updOne", (req, res) => {
  isPaid.push("birdone");
  res.json({ message: "success"}); // Отправка ответа клиенту
});

app.get("/updHone", (req, res) => {
  isPaid.push("heartone");
  res.json({ message: "success"}); // Отправка ответа клиенту
});

app.get("/updHtwo", (req, res) => {
  isPaid.push("hearttwo");
  res.json({ message: "success"}); // Отправка ответа клиенту
});

app.get("/updTwo", (req, res) => {
  isPaid.push("birdTwo");
  res.json({ message: "success"}); // Отправка ответа клиенту
});

app.get("/updBack", (req, res) => {
  isPaid.push("back");
  res.json({ message: "success"}); // Отправка ответа клиенту
});

// Запуск сервера Express
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
