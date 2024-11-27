<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Звездное небо с кругами</title>
    <style>
        body {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            overflow: hidden; /* Скрыть полосы прокрутки */
            margin: 0; /* Убираем отступы по умолчанию */
            position: relative; /* Для позиционирования */
            background-color: black; /* Устанавливаем черный фон */
        }

        .star {
            position: absolute; /* Позиционирование для звезды */
            border-radius: 50%; /* Круглая форма для звезды */
        }

        .circle {
            position: absolute; /* Позиционирование для круга */
            border-radius: 50%; /* Круглая форма */
        }
    </style>
</head>
<body>

<script>
    // Enum для цветов
    const StarColorEnum = {
        O: '#1E90FF',  // Голубые
        B: '#00BFFF',  // Бело-голубые
        A: '#FFFFFF',  // Белые
        F: '#FFD700',  // Желто-белые
        G: '#FFFF00',  // Желтые
        K: '#FFA500',  // Оранжевые
        M: '#FF4500'   // Красные
    };

    class StarColor {
        constructor(type, whiteMix = 0.8) {
            if (StarColorEnum[type]) {
                this.color = this.mixWithWhite(StarColorEnum[type], whiteMix);
            } else {
                throw new Error("Неверный тип цвета звезды: " + type);
            }
        }

        mixWithWhite(baseColor, whiteMix) {
            const r = parseInt(baseColor.slice(1, 3), 16);
            const g = parseInt(baseColor.slice(3, 5), 16);
            const b = parseInt(baseColor.slice(5, 7), 16);

            const mixedR = Math.round(r + (255 - r) * whiteMix);
            const mixedG = Math.round(g + (255 - g) * whiteMix);
            const mixedB = Math.round(b + (255 - b) * whiteMix);

            return `#${((1 << 24) + (mixedR << 16) + (mixedG << 8) + mixedB).toString(16).slice(1)}`;
        }
    }

    class Star {
        constructor(size, posX, posY, colorType) {
            this.size = size;
            this.posX = posX;
            this.posY = posY;
            this.color = new StarColor(colorType).color;

            this.element = document.createElement('div');
            this.element.classList.add('star');
            this.element.style.width = `${this.size}px`;
            this.element.style.height = `${this.size}px`;
            this.element.style.left = `${this.posX}px`;
            this.element.style.top = `${this.posY}px`;
            this.element.style.backgroundColor = this.color;

            document.body.appendChild(this.element);
        }
    }

    class Stars {
        constructor(starCount) {
            this.starCount = starCount;
            this.starTypes = Object.keys(StarColorEnum); // Получаем доступные типы звезд
            this.stars = [];

            this.create();
        }

        create() {
            for (let i = 0; i < this.starCount; i++) {
                const size = Math.random() * 5 + 2; // Случайный размер от 2 до 7 пикселей
                const posX = Math.random() * window.innerWidth; // Случайная позиция по X
                const posY = Math.random() * window.innerHeight; // Случайная позиция по Y
                const colorType = this.starTypes[Math.floor(Math.random() * this.starTypes.length)]; // Случайный цвет звезды
                const star = new Star(size, posX, posY, colorType); // Создаем звезду
                this.stars.push(star); // Сохраняем звезду в массив
            }
        }
    }

    class Space {
        constructor() {
            this.objects = []; // Массив для хранения объектов, например звезд
        }

        addObject(object) {
            if (object instanceof Star) {
                this.objects.push(object);
                console.log("Добавлена одна звезда.");
            } else if (object instanceof Stars) {
                this.objects.push(...object.stars); // Добавляем массив звёзд
                console.log("Добавлено несколько звезд.");
            } else {
                throw new Error("Неподдерживаемый объект для добавления: " + object);
            }
        }
    }

    class Circle {
        constructor(diameter, color, posX, posY, initialSpeedX, initialSpeedY) {
            this.diameter = diameter;
            this.color = color;
            this.posX = posX;
            this.posY = posY;
            this.speedX = initialSpeedX;
            this.speedY = initialSpeedY;
            this.isFalling = true;

            this.element = document.createElement('div');
            this.element.classList.add('circle');
            this.element.style.width = `${this.diameter}px`;
            this.element.style.height = `${this.diameter}px`;
            this.element.style.backgroundColor = this.color;

            this.element.style.left = `${this.posX}px`;
            this.element.style.top = `${this.posY}px`;
            document.body.appendChild(this.element);
        }
    }

    class World {
        constructor(gravity = 0.1, bounceFactor = 0.7, threshold = 0.5) {
            this.gravity = gravity;
            this.bounceFactor = bounceFactor;
            this.threshold = threshold;
            this.circles = [];
            this.windForce = 0;

            this.animate();

            window.addEventListener('keydown', this.handleKeyDown.bind(this));
        }

        addCircle(circle) {
            this.circles.push(circle); // Добавляем круг в массив
        }

        checkCollision(circle) {
            if (circle.posY + circle.diameter >= window.innerHeight) {
                circle.posY = window.innerHeight - circle.diameter;
                circle.speedY = -circle.speedY * this.bounceFactor;
            }
            if (circle.posX < 0) {
                circle.posX = 0;
                circle.speedX = Math.abs(circle.speedX) * this.bounceFactor;
            } else if (circle.posX + circle.diameter > window.innerWidth) {
                circle.posX = window.innerWidth - circle.diameter;
                circle.speedX = -Math.abs(circle.speedX) * this.bounceFactor;
            }
        }

        stopAnimation(circle) {
            if (Math.abs(circle.speedY) < this.threshold && circle.posY + circle.diameter >= window.innerHeight) {
                circle.speedY = 0;
                circle.isFalling = false;
            }
        }

        applyWind() {
            for (const circle of this.circles) {
                circle.posX += this.windForce * (circle.diameter / 100);
                circle.element.style.left = `${circle.posX}px`;
            }
        }

        handleKeyDown(event) {
            if (event.key === 'ArrowLeft') {
                this.windForce = -1;
            } else if (event.key === 'ArrowRight') {
                this.windForce = 1;
            }
        }

        animate() {
            for (const circle of this.circles) {
                if (circle.isFalling) {
                    circle.posY += circle.speedY;
                    circle.speedY += this.gravity;
                }

                circle.posX += circle.speedX;

                circle.element.style.top = `${circle.posY}px`;
                circle.element.style.left = `${circle.posX}px`;

                this.checkCollision(circle);
                this.stopAnimation(circle);
                this.applyWind();
            }

            requestAnimationFrame(this.animate.bind(this));
        }
    }

    // Создаем экземпляр космоса с 21 звездой
    const stars = new Stars(21);

    // Создаем экземпляр мира
    const space = new Space();
    space.addObject(stars); // Добавляем звёзды в пространство

    // Создаем экземпляр мира
    const world = new World();

    // Создаем экземпляры кругов и добавляем их в мир
    world.addCircle(new Circle(50, '#3498db', 100, 50, 2, 0)); // Первый круг
    world.addCircle(new Circle(70, '#e74c3c', 300, 100, 3, 0)); // Второй круг
    world.addCircle(new Circle(40, '#2ecc71', 500, 150, -2, 0)); // Третий круг
    world.addCircle(new Circle(60, '#9b59b6', 200, 30, 1.5, 0)); // Четвертый круг
    world.addCircle(new Circle(30, '#f1c40f', 150, 200, -1, 1)); // Пятый круг
    world.addCircle(new Circle(80, '#e67e22', 400, 250, 2, 1)); // Шестой круг
    world.addCircle(new Circle(90, '#34495e', 50, 100, 0.5, -1)); // Седьмой круг
    world.addCircle(new Circle(55, '#1abc9c', 600, 180, -1.5, 0)); // Восьмой круг

</script>

</body>
</html>
