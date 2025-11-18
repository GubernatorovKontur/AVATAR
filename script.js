// Eywa Tree Game - Interactive Landing Page
class EywaGame {
    constructor() {
        this.leads = [];
        this.animationId = null;
        this.isTreePulsing = false;
        this.scrollTimeout = null;
        this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        // Статистика по филиалам
        this.moscowStats = { leads: 0, payments: 0, points: 0 };
        this.westStats = { leads: 0, payments: 0, points: 0 };
        this.totalStats = { leads: 0, payments: 0, points: 0 };
        
        // Баллы по сотрудникам - обнуляем все
        this.employeePoints = {};
        
        // Массив сотрудников с ролями
        this.employees = [];
        
        // Добавляем всех сотрудников с 0 баллами
        const allEmployees = [
            // Племя Воды
            'Шведов Андрей Игоревич', 'Абдуллаева Сараи Интигам Кызы',
            'Беляева Наталья Александровна', 'Меркурьева Елена Вячеславовна',
            'Степанищева Ирина Евгеньевна', 'Трофимова Екатерина Александровна',
            'Яковлева Людмила Петровна', 'Петрова Анастасия Сергеевна',
            'Сагирова Елена Александровна', 'Киреева Римма Фансафовна',
            'Галимова Ксения Николаевна', 'Исхакова Ляйсан Римовна',
            'Булатова Алина Рудольфовна', 'Морозова Любовь Константиновна',
            'Морозова Марта Сергеевна', 'Саранцева Алёна Юрьевна',
            'Герасимова Ольга Вячеславовна', 'Сабирова Лилия Вилдановна',
            'Никулина Юлия Владимировна', 'Хамидуллина Юлия Олеговна',
            'Тихонова Гульнара Идрисовна', 'Павловец Дарья Викторовна',
            'Кострикина Наталья Андреевна', 'Филиппова Ольга Юрьевна',
            'Скопцова Марина Константиновна', 'Акимова Тамара Геннадьевна',
            'Никульшина Валерия Вадимовна', 'Цыганов Сергей Александрович',
            'Шаров Денис Александрович',
            'Утробина Жанна Алексеевна', 'Лавриченко Арина Александровна',
            'Юркина Ксения Александровна', 'Десницкая Ирина Игоревна',
            'Балашова Наталья Николаевна', 'Бикбаева Марина Константиновна',
            
            // Племя Воздуха
            'Зайцева Ольга Юрьевна', 'Лапшина Юлия Александровна',
            'Кирсанова Анастасия Евгеньевна', 'Шиханова Юлия Васильевна',
            'Вербушкина Полина Сергеевна', 'Малышева Яна Витальевна',
            'Морозова Валентина Николаевна', 'Иванова Ирина Юрьевна',
            'Кузь Софья Викторовна', 'Верховых Светлана Сергеевна',
            'Свиридчук Игорь Алексеевич', 'Китайцева Надежда Анзоровна',
            'Пак Евгения Гвансековна', 'Романова Юлия Михайловна',
            'Старков Владимир Алексеевич', 'Нежинская Анна Васильевна',
            'Михайловская Светлана Константиновна', 'Попова Татьяна Алексеевна',
            'Бахур Юлия Александровна', 'Белякова Виктория Владимировна'
        ];
        
        allEmployees.forEach(employee => {
            this.employeePoints[employee] = { leadPoints: 0, paymentPoints: 0, total: 0 };
        });
        
        // Детальная статистика по сотрудникам - обнуляем
        this.employeeDetails = {};
        
        this.init();
    }

    async loadGameData() {
        try {
            console.log('Начинаем загрузку данных...');
            const response = await fetch('game-data.json');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Загружены данные игры:', data);
            console.log('Количество команд:', data.teams.length);
            console.log('Количество сотрудников:', data.employees.length);
            
            // Сохраняем статистику кланов
            this.clanStats = data.clanStats;
            
            // Парсим данные команд
            this.parseTeamData(data.teams);
            
            // Парсим данные сотрудников
            this.parseEmployeeData(data.employees);
            
            // Пересчитываем статистику
            this.calculateBranchStats();
            this.updateStats();
            this.updateLeaderboard();
            
            // Отрисовываем огоньки на дереве
            this.renderLeadsOnTree();
            
            console.log('Данные успешно загружены и обработаны');
            
        } catch (error) {
            console.error('Ошибка загрузки данных из game-data.json:', error);
            alert('Ошибка загрузки данных: ' + error.message);
        }
    }

    parseTeamData(teams) {
        // Сбрасываем статистику перед подсчетом
        this.moscowStats = { leads: 0, payments: 0, points: 0, amount: 0 };
        this.westStats = { leads: 0, payments: 0, points: 0, amount: 0 };
        
        teams.forEach(team => {
            console.log('Команда:', team.team, 'Клан:', team.clan, 'Лиды:', team.leadPoints, 'Оплаты:', team.paymentPoints, 'Баллы:', team.totalPoints);
            
            // Определяем к какому МРЦ относится команда
            if (team.clan === 'Клан воздуха') {
                this.moscowStats.leads += team.leadPoints;
                this.moscowStats.payments += team.paymentPoints;
                this.moscowStats.points += team.totalPoints;
            } else if (team.clan === 'Клан воды') {
                this.westStats.leads += team.leadPoints;
                this.westStats.payments += team.paymentPoints;
                this.westStats.points += team.totalPoints;
            }
        });
        
        console.log('Статистика после парсинга команд:', {
            moscow: this.moscowStats,
            west: this.westStats
        });
    }

    parseEmployeeData(employees) {
        console.log('Парсим данные сотрудников:', employees.length);
        
        // Сохраняем данные сотрудников с ролями
        this.employees = employees;
        
        employees.forEach(employee => {
            console.log('Сотрудник:', employee.name, 'Клан:', employee.clan, 'Лиды:', employee.leadPoints, 'Оплаты:', employee.paymentPoints, 'Баллы:', employee.totalPoints);
            
            // Обновляем баллы сотрудника
            if (this.employeePoints[employee.name]) {
                this.employeePoints[employee.name] = {
                    leadPoints: employee.leadPoints,
                    paymentPoints: employee.paymentPoints,
                    total: employee.totalPoints
                };
                console.log(`Обновлены баллы для ${employee.name}:`, this.employeePoints[employee.name]);
            } else {
                console.log(`Сотрудник ${employee.name} не найден в списке!`);
            }
        });
        
        // Проверяем сотрудников племени воды
        const waterEmployees = employees.filter(emp => emp.clan === 'Клан воды');
        console.log('Сотрудники племени воды:', waterEmployees);
        
        waterEmployees.forEach(emp => {
            console.log(`Вода: ${emp.name} - Лиды: ${emp.leadPoints}, Оплаты: ${emp.paymentPoints}`);
        });
    }

    async init() {
        this.setupEventListeners();
        await this.loadGameData(); // Загружаем данные из game-data.json
        this.startAnimations();
        this.setupParallax();
        this.setupSmoothScrolling();
        this.setupBackgroundMusic();
        this.updateStats();
        this.renderLeadsOnTree();
    }

    setupEventListeners() {
        // Navigation
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                this.scrollToSection(targetId);
            });
        });

        // Mobile navigation toggle
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                navToggle.classList.toggle('active');
            });
        }



        // Lead popup
        const popupClose = document.getElementById('popupClose');
        const leadPopup = document.getElementById('leadPopup');
        if (popupClose && leadPopup) {
            popupClose.addEventListener('click', () => {
                this.closeLeadPopup();
            });
            leadPopup.addEventListener('click', (e) => {
                if (e.target === leadPopup) {
                    this.closeLeadPopup();
                }
            });
        }

        // Products popup
        const productCard = document.getElementById('productCard');
        const productsPopupClose = document.getElementById('productsPopupClose');
        const productsPopup = document.getElementById('productsPopup');
        
        if (productCard) {
            productCard.addEventListener('click', () => {
                this.showProductsPopup();
            });
        }
        
        if (productsPopupClose && productsPopup) {
            productsPopupClose.addEventListener('click', () => {
                this.closeProductsPopup();
            });
            productsPopup.addEventListener('click', (e) => {
                if (e.target === productsPopup) {
                    this.closeProductsPopup();
                }
            });
        }

        // Points system popup
        const pointsCard = document.getElementById('pointsCard');
        const pointsPopupClose = document.getElementById('pointsPopupClose');
        const pointsPopup = document.getElementById('pointsPopup');
        
        if (pointsCard) {
            pointsCard.addEventListener('click', () => {
                this.showPointsPopup();
            });
        }
        
        if (pointsPopupClose && pointsPopup) {
            pointsPopupClose.addEventListener('click', () => {
                this.closePointsPopup();
            });
            pointsPopup.addEventListener('click', (e) => {
                if (e.target === pointsPopup) {
                    this.closePointsPopup();
                }
            });
        }

        // Scroll indicator
        const scrollIndicator = document.querySelector('.scroll-indicator');
        if (scrollIndicator) {
            scrollIndicator.addEventListener('click', () => {
                this.scrollToSection('mission');
            });
        }

        // Music auto-start (no button needed)

        // Window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Scroll events
        window.addEventListener('scroll', () => {
            this.handleScroll();
        });
    }


    calculateBranchStats() {
        // Подсчитываем общую статистику
        this.totalStats.leads = this.moscowStats.leads + this.westStats.leads;
        this.totalStats.payments = this.moscowStats.payments + this.westStats.payments;
        this.totalStats.points = this.moscowStats.points + this.westStats.points;
        this.totalStats.amount = this.moscowStats.amount + this.westStats.amount;
    }

    calculateLeadPoints(leadCount) {
        // 0-3 лида = 0 баллов, 4+ лидов = 1 балл
        return leadCount >= 4 ? 1 : 0;
    }

    calculatePaymentPoints(amount) {
        // 0-10k=1, 10-30k=10, 30-50k=15, 50k+=25
        if (amount < 10000) return 1;
        if (amount < 30000) return 10;
        if (amount < 50000) return 15;
        return 25;
    }

    startAnimations() {
        // Skip animations if user prefers reduced motion
        if (this.isReducedMotion) {
            this.animateStats();
            return;
        }
        
        // Tree pulsing animation
        this.startTreePulse();
        
        // Particle animation
        this.animateParticles();
        
        // Stats counter animation
        this.animateStats();
        
    }

    startTreePulse() {
        const tree = document.getElementById('eywaTree');
        if (!tree || this.isTreePulsing) return;
        
        this.isTreePulsing = true;
        const pulse = () => {
            tree.style.transform = 'scale(1.02)';
            setTimeout(() => {
                tree.style.transform = 'scale(1)';
            }, 1000);
            setTimeout(pulse, 5000);
        };
        pulse();
    }

    animateParticles() {
        const particles = document.querySelectorAll('.particle');
        particles.forEach((particle, index) => {
            const delay = index * 0.3;
            const duration = 8 + Math.random() * 4; // 8-12 seconds
            setTimeout(() => {
                particle.style.animation = `float ${duration}s ease-in-out infinite`;
                particle.style.animationDelay = `${Math.random() * 2}s`;
            }, delay * 1000);
        });
    }

    animateStats() {
        const moscowStats = {
            leads: document.getElementById('moscowLeads'),
            payments: document.getElementById('moscowPayments'),
            points: document.getElementById('moscowPoints')
        };

        const westStats = {
            leads: document.getElementById('westLeads'),
            payments: document.getElementById('westPayments'),
            points: document.getElementById('westPoints')
        };

        const totalStats = {
            leads: document.getElementById('totalLeads'),
            payments: document.getElementById('totalPayments'),
            points: document.getElementById('totalPoints')
        };

        // Анимируем статистику Московского МРЦ из clanStats
        if (moscowStats.leads && this.clanStats?.air) {
            this.animateCounter(moscowStats.leads, 0, this.clanStats.air.leadPoints || 0, 2000);
        }
        if (moscowStats.payments && this.clanStats?.air) {
            this.animateCounter(moscowStats.payments, 0, this.clanStats.air.paymentPoints || 0, 2000);
        }
        if (moscowStats.points && this.clanStats?.air) {
            this.animateCounter(moscowStats.points, 0, this.clanStats.air.totalPoints || 0, 2000);
        }

        // Анимируем статистику Западного МРЦ из clanStats
        if (westStats.leads && this.clanStats?.water) {
            this.animateCounter(westStats.leads, 0, this.clanStats.water.leadPoints || 0, 2000);
        }
        if (westStats.payments && this.clanStats?.water) {
            this.animateCounter(westStats.payments, 0, this.clanStats.water.paymentPoints || 0, 2000);
        }
        if (westStats.points && this.clanStats?.water) {
            this.animateCounter(westStats.points, 0, this.clanStats.water.totalPoints || 0, 2000);
        }

        // Анимируем общую статистику из clanStats
        const totalLeadsValue = (this.clanStats?.air?.leadPoints || 0) + (this.clanStats?.water?.leadPoints || 0);
        const totalPaymentsValue = (this.clanStats?.air?.paymentPoints || 0) + (this.clanStats?.water?.paymentPoints || 0);
        const totalPointsValue = (this.clanStats?.air?.totalPoints || 0) + (this.clanStats?.water?.totalPoints || 0);
        
        if (totalStats.leads) {
            this.animateCounter(totalStats.leads, 0, totalLeadsValue, 2000);
        }
        if (totalStats.payments) {
            this.animateCounter(totalStats.payments, 0, totalPaymentsValue, 2000);
        }
        if (totalStats.points) {
            this.animateCounter(totalStats.points, 0, totalPointsValue, 2000);
        }
    }

    animateCounter(element, start, end, duration) {
        const startTime = performance.now();
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const current = Math.floor(start + (end - start) * this.easeOutQuart(progress));
            
            element.textContent = current;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        requestAnimationFrame(animate);
    }

    easeOutQuart(t) {
        return 1 - Math.pow(1 - t, 4);
    }



    renderLeadsOnTree() {
        const container = document.getElementById('leadsContainer');
        if (!container) {
            console.log('Контейнер leadsContainer не найден');
            return;
        }
        
        console.log('Отрисовываем огоньки на дереве...');
        console.log('Статистика:', {
            moscow: this.moscowStats,
            west: this.westStats,
            total: this.totalStats
        });
        
        // Clear existing leads
        container.innerHTML = '';
        
        // Создаем огоньки на основе реальных данных
        this.createTreeDots();
    }
    
    createTreeDots() {
        const container = document.getElementById('leadsContainer');
        let dotIndex = 0;
        
        // Создаем огоньки на основе реальных данных сотрудников
        let waterDots = 0, airDots = 0;
        
        console.log('Создаем огоньки для сотрудников:', Object.keys(this.employeePoints).length);
        
        Object.entries(this.employeePoints).forEach(([employeeName, points]) => {
            // Определяем к какому клану принадлежит сотрудник
            const isWaterClan = [
                'Шведов Андрей Игоревич', 'Абдуллаева Сараи Интигам Кызы',
                'Беляева Наталья Александровна', 'Меркурьева Елена Вячеславовна',
                'Степанищева Ирина Евгеньевна', 'Трофимова Екатерина Александровна',
                'Яковлева Людмила Петровна', 'Петрова Анастасия Сергеевна',
                'Сагирова Елена Александровна', 'Киреева Римма Фансафовна',
                'Галимова Ксения Николаевна', 'Исхакова Ляйсан Римовна',
                'Булатова Алина Рудольфовна', 'Морозова Любовь Константиновна',
                'Морозова Марта Сергеевна', 'Саранцева Алёна Юрьевна',
                'Герасимова Ольга Вячеславовна', 'Сабирова Лилия Вилдановна',
                'Никулина Юлия Владимировна', 'Хамидуллина Юлия Олеговна',
                'Тихонова Гульнара Идрисовна', 'Павловец Дарья Викторовна',
                'Кострикина Наталья Андреевна', 'Филиппова Ольга Юрьевна',
                'Скопцова Марина Константиновна', 'Акимова Тамара Геннадьевна',
                'Никульшина Валерия Вадимовна', 'Цыганов Сергей Александрович',
                'Шаров Денис Александрович',
                'Утробина Жанна Алексеевна', 'Лавриченко Арина Александровна',
                'Юркина Ксения Александровна', 'Десницкая Ирина Игоревна',
                'Балашова Наталья Николаевна', 'Бикбаева Марина Константиновна'
            ].includes(employeeName);
            
            const isAirClan = [
                'Зайцева Ольга Юрьевна', 'Лапшина Юлия Александровна',
                'Кирсанова Анастасия Евгеньевна', 'Шиханова Юлия Васильевна',
                'Вербушкина Полина Сергеевна', 'Малышева Яна Витальевна',
                'Морозова Валентина Николаевна', 'Иванова Ирина Юрьевна',
                'Кузь Софья Викторовна', 'Верховых Светлана Сергеевна',
                'Свиридчук Игорь Алексеевич', 'Китайцева Надежда Анзоровна',
                'Пак Евгения Гвансековна', 'Романова Юлия Михайловна',
                'Старков Владимир Алексеевич', 'Нежинская Анна Васильевна',
                'Михайловская Светлана Константиновна', 'Попова Татьяна Алексеевна',
                'Бахур Юлия Александровна', 'Белякова Виктория Владимировна'
            ].includes(employeeName);
            
            const branch = isWaterClan ? 'west' : (isAirClan ? 'moscow' : null);
            if (!branch) {
                console.log(`Сотрудник ${employeeName} не в наших кланах, пропускаем`);
                return; // Пропускаем сотрудников, которые не в наших кланах
            }
            
            console.log(`Сотрудник: ${employeeName}, Клан: ${isWaterClan ? 'Воды' : 'Воздуха'}, Лиды: ${points.leadPoints}, Оплаты: ${points.paymentPoints}`);
            
            // Создаем только один кружок для лидов (если есть)
            if (points.leadPoints > 0) {
                const dot = document.createElement('div');
                const className = branch === 'moscow' ? 'lead-dot dot-air-lead' : 'lead-dot dot-water-lead';
                dot.className = className;
                dot.title = `${employeeName} - Лиды: ${points.leadPoints}`;
                
                // Добавляем текст с количеством баллов внутри кружка
                const pointsText = document.createElement('span');
                pointsText.className = 'dot-points';
                pointsText.textContent = points.leadPoints;
                dot.appendChild(pointsText);
                
                this.positionDotOnTree(dot, dotIndex++);
                this.addDotClickHandler(dot, 'lead', branch, employeeName, points.leadPoints);
                container.appendChild(dot);
                
                if (branch === 'west') waterDots++;
                else airDots++;
            }
            
            // Создаем только один кружок для оплат (если есть)
            if (points.paymentPoints > 0) {
                const dot = document.createElement('div');
                const className = branch === 'moscow' ? 'lead-dot dot-air-payment' : 'lead-dot dot-water-payment';
                dot.className = className;
                dot.title = `${employeeName} - Оплаты: ${points.paymentPoints}`;
                
                // Добавляем текст с количеством баллов внутри кружка
                const pointsText = document.createElement('span');
                pointsText.className = 'dot-points';
                pointsText.textContent = points.paymentPoints;
                dot.appendChild(pointsText);
                
                this.positionDotOnTree(dot, dotIndex++);
                this.addDotClickHandler(dot, 'payment', branch, employeeName, points.paymentPoints);
                container.appendChild(dot);
                
                if (branch === 'west') waterDots++;
                else airDots++;
            }
        });
        
        console.log(`Создано ${dotIndex} огоньков на дереве:`);
        console.log(`- Племя Воздуха (Московский МРЦ): ${airDots} огоньков`);
        console.log(`- Племя Воды (Западный МРЦ): ${waterDots} огоньков`);
    }
    
    addDotClickHandler(dot, type, branch, employeeName, number) {
        dot.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showDotInfo(type, branch, employeeName, number);
        });
    }
    
    showDotInfo(type, branch, employeeName, number) {
        const branchName = branch === 'moscow' ? 'Московский МРЦ (Племя Воздуха)' : 'Западный МРЦ (Племя Воды)';
        const typeName = type === 'lead' ? 'Лид' : 'Оплата';
        const symbol = branch === 'moscow' ? '🌀' : '🌊';
        const color = branch === 'moscow' ? (type === 'lead' ? 'белый' : 'зеленый') : (type === 'lead' ? 'розовый' : 'синий');
        
        // Находим роль сотрудника
        const employee = this.employees && this.employees.find ? this.employees.find(emp => emp.name === employeeName) : null;
        const roleInfo = employee ? `${employee.roleEmoji} ${employee.role}` : 'На\'ви';
        
        // Показываем красивое модальное окно вместо alert
        this.showLeadPopup({
            company: `${symbol} ${branchName}`,
            employee: employeeName,
            role: roleInfo,
            type: typeName,
            color: color,
            number: number
        });
    }

    showLeadPopup(lead) {
        const popup = document.getElementById('leadPopup');
        const company = document.getElementById('leadCompany');
        const role = document.getElementById('leadRole');
        const employee = document.getElementById('leadEmployee');
        const type = document.getElementById('leadType');
        
        if (popup && company && role && employee && type) {
            company.textContent = lead.company;
            role.textContent = lead.role || 'На\'ви';
            employee.textContent = lead.employee;
            type.textContent = lead.type;
            
            popup.classList.add('active');
        }
    }

    closeLeadPopup() {
        const popup = document.getElementById('leadPopup');
        if (popup) {
            popup.classList.remove('active');
        }
    }
    
    positionDotOnTree(dot, index) {
        // Создаем сетку позиций для равномерного распределения
        const gridSize = 8; // 8x8 сетка
        const row = Math.floor(index / gridSize);
        const col = index % gridSize;
        
        // Базовые позиции в процентах
        const baseX = 10 + (col * 10); // От 10% до 80% с шагом 10%
        const baseY = 15 + (row * 10); // От 15% до 85% с шагом 10%
        
        // Добавляем случайное смещение для естественности
        const randomOffsetX = (Math.random() - 0.5) * 8;
        const randomOffsetY = (Math.random() - 0.5) * 8;
        
        const finalX = Math.max(5, Math.min(90, baseX + randomOffsetX));
        const finalY = Math.max(10, Math.min(90, baseY + randomOffsetY));
        
        dot.style.left = `${finalX}%`;
        dot.style.top = `${finalY}%`;
        
        // Анимация появления
        dot.style.opacity = '0';
        dot.style.transform = 'scale(0)';
        
        setTimeout(() => {
            dot.style.transition = 'all 0.5s ease';
            dot.style.opacity = '1';
            dot.style.transform = 'scale(1)';
        }, index * 100);
    }


    showProductsPopup() {
        const popup = document.getElementById('productsPopup');
        if (popup) {
            popup.classList.add('active');
        }
    }

    closeProductsPopup() {
        const popup = document.getElementById('productsPopup');
        if (popup) {
            popup.classList.remove('active');
        }
    }

    showPointsPopup() {
        const popup = document.getElementById('pointsPopup');
        if (popup) {
            popup.classList.add('active');
        }
    }

    closePointsPopup() {
        const popup = document.getElementById('pointsPopup');
        if (popup) {
            popup.classList.remove('active');
        }
    }

    updateStats() {
        console.log('Обновляем статистику:', {
            moscow: this.moscowStats,
            west: this.westStats,
            total: this.totalStats
        });
        
        // Update statistics counters
        const moscowLeads = document.getElementById('moscowLeads');
        const moscowPayments = document.getElementById('moscowPayments');
        const moscowPoints = document.getElementById('moscowPoints');
        const moscowAmount = document.getElementById('moscowAmount');
        
        const westLeads = document.getElementById('westLeads');
        const westPayments = document.getElementById('westPayments');
        const westPoints = document.getElementById('westPoints');
        const westAmount = document.getElementById('westAmount');
        
        const totalLeads = document.getElementById('totalLeads');
        const totalPayments = document.getElementById('totalPayments');
        const totalPoints = document.getElementById('totalPoints');
        const totalAmount = document.getElementById('totalAmount');
        
        if (moscowLeads) {
            moscowLeads.textContent = this.clanStats?.air?.leadPoints || 0;
            console.log('Московские лиды:', this.clanStats?.air?.leadPoints || 0);
        }
        if (moscowPayments) moscowPayments.textContent = this.clanStats?.air?.paymentPoints || 0;
        if (moscowPoints) moscowPoints.textContent = this.clanStats?.air?.totalPoints || 0;
        if (moscowAmount) moscowAmount.textContent = (this.clanStats?.air?.totalAmount || 0).toLocaleString('ru-RU');
        
        if (westLeads) {
            westLeads.textContent = this.clanStats?.water?.leadPoints || 0;
            console.log('Западные лиды:', this.clanStats?.water?.leadPoints || 0);
        }
        if (westPayments) westPayments.textContent = this.clanStats?.water?.paymentPoints || 0;
        if (westPoints) westPoints.textContent = this.clanStats?.water?.totalPoints || 0;
        if (westAmount) westAmount.textContent = (this.clanStats?.water?.totalAmount || 0).toLocaleString('ru-RU');
        
        const totalLeadsValue = (this.clanStats?.air?.leadPoints || 0) + (this.clanStats?.water?.leadPoints || 0);
        const totalPaymentsValue = (this.clanStats?.air?.paymentPoints || 0) + (this.clanStats?.water?.paymentPoints || 0);
        const totalPointsValue = (this.clanStats?.air?.totalPoints || 0) + (this.clanStats?.water?.totalPoints || 0);
        const totalAmountValue = (this.clanStats?.air?.totalAmount || 0) + (this.clanStats?.water?.totalAmount || 0);
        
        if (totalLeads) {
            totalLeads.textContent = totalLeadsValue;
            console.log('Общие лиды:', totalLeadsValue);
        }
        if (totalPayments) totalPayments.textContent = totalPaymentsValue;
        if (totalPoints) totalPoints.textContent = totalPointsValue;
        if (totalAmount) totalAmount.textContent = totalAmountValue.toLocaleString('ru-RU');
        
        // Update leaderboard with employee points
        this.updateLeaderboard();
    }
    
    updateLeaderboard() {
        console.log('updateLeaderboard called');
        const airClanList = document.querySelector('.air-clan .employees-list');
        const waterClanList = document.querySelector('.water-clan .employees-list');
        
        if (airClanList && waterClanList) {
            // Clear existing lists
            airClanList.innerHTML = '';
            waterClanList.innerHTML = '';
            
            // Sort employees by total points (descending)
            const sortedEmployees = Object.entries(this.employeePoints)
                .filter(([employee, points]) => points.total > 0) // Показываем только сотрудников с баллами
                .sort(([,a], [,b]) => b.total - a.total);
            
            console.log('Sorted employees with points:', sortedEmployees);
            
            sortedEmployees.forEach(([employee, points]) => {
                const employeeItem = document.createElement('div');
                employeeItem.className = 'employee-item';
                
                const isWaterClan = [
                    'Шведов Андрей Игоревич', 'Абдуллаева Сараи Интигам Кызы',
                    'Беляева Наталья Александровна', 'Меркурьева Елена Вячеславовна',
                    'Степанищева Ирина Евгеньевна', 'Трофимова Екатерина Александровна',
                    'Яковлева Людмила Петровна', 'Петрова Анастасия Сергеевна',
                    'Сагирова Елена Александровна', 'Киреева Римма Фансафовна',
                    'Галимова Ксения Николаевна', 'Исхакова Ляйсан Римовна',
                    'Булатова Алина Рудольфовна', 'Морозова Любовь Константиновна',
                    'Морозова Марта Сергеевна', 'Саранцева Алёна Юрьевна',
                    'Герасимова Ольга Вячеславовна', 'Сабирова Лилия Вилдановна',
                    'Никулина Юлия Владимировна', 'Хамидуллина Юлия Олеговна',
                    'Тихонова Гульнара Идрисовна', 'Павловец Дарья Викторовна',
                    'Кострикина Наталья Андреевна', 'Филиппова Ольга Юрьевна',
                    'Скопцова Марина Константиновна', 'Акимова Тамара Геннадьевна',
                    'Никульшина Валерия Вадимовна', 'Цыганов Сергей Александрович',
                    'Шаров Денис Александрович',
                    'Утробина Жанна Алексеевна', 'Лавриченко Арина Александровна',
                    'Юркина Ксения Александровна', 'Десницкая Ирина Игоревна',
                    'Балашова Наталья Николаевна', 'Бикбаева Марина Константиновна'
                ].includes(employee);
                
                const isAirClan = [
                    'Зайцева Ольга Юрьевна', 'Лапшина Юлия Александровна',
                    'Кирсанова Анастасия Евгеньевна', 'Шиханова Юлия Васильевна',
                    'Вербушкина Полина Сергеевна', 'Малышева Яна Витальевна',
                    'Морозова Валентина Николаевна', 'Иванова Ирина Юрьевна',
                    'Кузь Софья Викторовна', 'Верховых Светлана Сергеевна',
                    'Свиридчук Игорь Алексеевич', 'Китайцева Надежда Анзоровна',
                    'Пак Евгения Гвансековна', 'Романова Юлия Михайловна',
                    'Старков Владимир Алексеевич', 'Нежинская Анна Васильевна',
                    'Михайловская Светлана Константиновна', 'Попова Татьяна Алексеевна',
                    'Бахур Юлия Александровна', 'Белякова Виктория Владимировна'
                ].includes(employee);
                
                // Находим роль сотрудника
                const employeeData = this.employees && this.employees.find ? this.employees.find(emp => emp.name === employee) : null;
                const roleInfo = employeeData ? `${employeeData.roleEmoji} ${employeeData.role}` : 'На\'ви';
                
                const pointsText = this.getPointsText(points.total);
                
                employeeItem.innerHTML = `
                    <div class="employee-role">${roleInfo}</div>
                    <span class="employee-name">${employee}</span>
                    <span class="employee-points">${points.total} ${pointsText}</span>
                `;
                
                if (isWaterClan) {
                    waterClanList.appendChild(employeeItem);
                } else if (isAirClan) {
                    airClanList.appendChild(employeeItem);
                }
            });
        }
    }

    setupParallax() {
        const parallaxElements = document.querySelectorAll('.eywa-tree, .tree-glow');
        
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            
            parallaxElements.forEach(element => {
                element.style.transform = `translateY(${rate}px)`;
            });
        });
    }

    setupSmoothScrolling() {
        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    setupBackgroundMusic() {
        const backgroundMusic = document.getElementById('backgroundMusic');
        if (!backgroundMusic) return;

        // Устанавливаем громкость (30% от максимальной)
        backgroundMusic.volume = 0.3;

        // Устанавливаем автозапуск и зацикливание
        backgroundMusic.loop = true;
        backgroundMusic.autoplay = true;

        // Пытаемся запустить музыку при загрузке страницы
        const playMusic = async () => {
            try {
                await backgroundMusic.play();
                console.log('Фоновая музыка запущена автоматически');
            } catch (error) {
                console.log('Автовоспроизведение заблокировано браузером:', error);
                // Если автовоспроизведение заблокировано, показываем кнопку для запуска
                this.showMusicPlayButton();
            }
        };

        // Запускаем музыку после небольшой задержки
        setTimeout(playMusic, 1000);

        // Обработка ошибок загрузки
        backgroundMusic.addEventListener('error', (e) => {
            console.error('Ошибка загрузки музыки:', e);
        });

        // Обработка окончания загрузки
        backgroundMusic.addEventListener('canplaythrough', () => {
            console.log('Музыка готова к воспроизведению');
        });
    }

    showMusicPlayButton() {
        // Создаем кнопку для запуска музыки
        const playButton = document.createElement('button');
        playButton.id = 'musicPlayButton';
        playButton.innerHTML = '🎵 Включить музыку';
        playButton.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(45deg, var(--primary-green), var(--bioluminescent-blue));
            color: var(--cosmic-black);
            border: none;
            padding: 12px 20px;
            border-radius: 25px;
            font-weight: 600;
            cursor: pointer;
            z-index: 1000;
            box-shadow: 0 5px 15px rgba(0, 255, 136, 0.3);
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
        `;

        playButton.addEventListener('click', async () => {
            const backgroundMusic = document.getElementById('backgroundMusic');
            if (backgroundMusic) {
                try {
                    await backgroundMusic.play();
                    playButton.remove();
                    console.log('Музыка запущена пользователем');
                } catch (error) {
                    console.error('Ошибка воспроизведения:', error);
                }
            }
        });

        playButton.addEventListener('mouseenter', () => {
            playButton.style.transform = 'translateY(-2px)';
            playButton.style.boxShadow = '0 8px 20px rgba(0, 255, 136, 0.4)';
        });

        playButton.addEventListener('mouseleave', () => {
            playButton.style.transform = 'translateY(0)';
            playButton.style.boxShadow = '0 5px 15px rgba(0, 255, 136, 0.3)';
        });

        document.body.appendChild(playButton);
    }

    // Music functions removed - music now plays automatically

    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    getPointsText(points) {
        if (points === 1) return 'балл';
        if (points >= 2 && points <= 4) return 'балла';
        return 'баллов';
    }


    handleResize() {
        // Recalculate tree positions on resize
        this.renderLeadsOnTree();
    }

    handleScroll() {
        // Throttle scroll events for better performance
        if (this.scrollTimeout) {
            clearTimeout(this.scrollTimeout);
        }
        
        this.scrollTimeout = setTimeout(() => {
            const scrolled = window.pageYOffset;
            const header = document.querySelector('.header');
            
            // Header background opacity based on scroll
            if (header) {
                const opacity = Math.min(scrolled / 100, 0.95);
                header.style.background = `rgba(10, 10, 10, ${opacity})`;
            }
            
            // Parallax effects (only on desktop)
            if (window.innerWidth > 768) {
                const parallaxElements = document.querySelectorAll('.eywa-tree, .tree-glow');
                const rate = scrolled * -0.3;
                
                parallaxElements.forEach(element => {
                    element.style.transform = `translateY(${rate}px)`;
                });
            }
            
            // Section visibility animations
            this.animateOnScroll();
        }, 16); // ~60fps
    }

    animateOnScroll() {
        const sections = document.querySelectorAll('section');
        const windowHeight = window.innerHeight;
        
        sections.forEach(section => {
            const sectionTop = section.getBoundingClientRect().top;
            const sectionVisible = sectionTop < windowHeight * 0.8;
            
            if (sectionVisible) {
                section.classList.add('animate-in');
            }
        });
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new EywaGame();
});

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    .animate-in {
        animation: slideInUp 0.8s ease forwards;
    }
    
    @keyframes slideInUp {
        from {
            opacity: 0;
            transform: translateY(50px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes rippleExpand {
        0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 0.8;
        }
        100% {
            transform: translate(-50%, -50%) scale(3);
            opacity: 0;
        }
    }
    
    .nav-menu.active {
        display: flex;
        flex-direction: column;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: rgba(10, 10, 10, 0.95);
        backdrop-filter: blur(10px);
        padding: 1rem;
        border-top: 1px solid rgba(0, 255, 136, 0.2);
    }
    
    .nav-toggle.active span:nth-child(1) {
        transform: rotate(45deg) translate(5px, 5px);
    }
    
    .nav-toggle.active span:nth-child(2) {
        opacity: 0;
    }
    
    .nav-toggle.active span:nth-child(3) {
        transform: rotate(-45deg) translate(7px, -6px);
    }
    
    .join-form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    
    .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .form-group label {
        color: var(--primary-green);
        font-weight: 600;
    }
    
    .form-group input,
    .form-group select {
        padding: 0.75rem;
        border: 1px solid rgba(0, 255, 136, 0.3);
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.05);
        color: var(--text-light);
        font-size: 1rem;
    }
    
    .form-group input:focus,
    .form-group select:focus {
        outline: none;
        border-color: var(--primary-green);
        box-shadow: 0 0 10px rgba(0, 255, 136, 0.3);
    }
    
    .submit-btn {
        padding: 1rem;
        background: linear-gradient(45deg, var(--primary-green), var(--bioluminescent-blue));
        color: var(--cosmic-black);
        border: none;
        border-radius: 8px;
        font-weight: 700;
        font-size: 1.1rem;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .submit-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0, 255, 136, 0.3);
    }
    
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid rgba(0, 255, 136, 0.2);
    }
    
    .modal-header h3 {
        font-family: 'Orbitron', monospace;
        color: var(--primary-green);
        margin: 0;
    }
    
    .modal-close {
        background: none;
        border: none;
        color: var(--primary-green);
        font-size: 1.5rem;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .modal-close:hover {
        color: var(--text-light);
        transform: scale(1.2);
    }
    
    .modal-body p {
        margin-bottom: 1.5rem;
        color: var(--text-light);
        opacity: 0.9;
    }
`;
document.head.appendChild(style);
