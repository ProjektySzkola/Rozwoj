Oto szczegółowa dokumentacja struktury arkusza kalkulacyjnego **„Turniej_Database”**, opisująca zawartość poszczególnych tabel oraz znaczenie ich nagłówków:

### 1. Tabela: `players` (Zawodnicy)

Służy do przechowywania danych osobowych i statusu uczestników turnieju.

* 
**player_id**: Unikalny identyfikator zawodnika.


* 
**first_name**: Imię zawodnika.


* 
**last_name**: Nazwisko zawodnika.


* 
**class_id**: Identyfikator klasy, do której uczęszcza zawodnik.


* 
**is_captain**: Informacja, czy zawodnik pełni funkcję kapitana drużyny.


* 
**has_paid**: Status płatności wpisowego.


* 
**consents_signed**: Potwierdzenie podpisania wymaganych zgód.


* 
**notes**: Dodatkowe uwagi (np. informacje o kontuzjach).


* 
**team_id**: Identyfikator drużyny, do której przypisany jest zawodnik.



### 2. Tabela: `teams` (Drużyny)

Zawiera listę zespołów biorących udział w rozgrywkach.

* 
**team_id**: Unikalny identyfikator drużyny.


* 
**team_name**: Nazwa własna zespołu.


* 
**class_id**: Klasa reprezentowana przez drużynę.


* 
**logo_url**: Link do pliku graficznego z logo drużyny.


* 
**payment_status**: Informacja o rozliczeniu finansowym całej drużyny.


* 
**notes**: Dodatkowe notatki dotyczące zespołu.



### 3. Tabele meczowe (`matches_football`, `matches_basketball`, `matches_volleyball`)

Rejestrują zaplanowane spotkania oraz ich rezultaty.

* 
**match_id**: Unikalny kod meczu (np. F1, B1, V1).


* 
**poziom_meczu**: Faza rozgrywek (np. liga, play-off).


* 
**date**: Data rozegrania spotkania.


* 
**team_a_id / team_b_id**: Identyfikatory drużyn rywalizujących.


* 
**score_a / score_b**: Liczba punktów/bramek zdobytych przez drużyny (w piłce nożnej i koszykówce).


* 
**set1_a...set3_b**: Wyniki poszczególnych setów (wyłącznie w siatkówce).


* 
**final_sets_a / final_sets_b**: Ostateczny wynik w setach (wyłącznie w siatkówce).


* 
**place**: Miejsce rozgrywek (np. konkretna sala).


* 
**referee**: Dane sędziego prowadzącego mecz.


* 
**Time**: Godzina rozpoczęcia meczu.


* 
**status**: Aktualny stan meczu (np. zaplanowany, w trakcie, zakończony).


* 
**notatki**: Dodatkowe uwagi do przebiegu spotkania.



### 4. Tabele logów (`log_football`, `log_basketball`, `log_volleyball`)

Szczegółowa historia zdarzeń boiskowych rejestrowana w czasie rzeczywistym.

* 
**ID_zdarzenia**: Unikalny numer wpisu w logu.


* 
**ID_meczu**: Powiązanie zdarzenia z konkretnym meczem.


* 
**Drużyna**: Wskazanie, czy zdarzenie dotyczy Gospodarza czy Gościa.


* 
**Zawodnik (ID)**: Identyfikator zawodnika, który brał udział w akcji.


* 
**Typ_zdarzenia**: Rodzaj akcji (np. punkty, faul, asysta).


* 
**Wartość**: Wartość liczbowa lub opisowa zdarzenia (np. liczba punktów, kolor kartki).


* 
**Dodatkowe_info**: Opisowy detal zdarzenia (np. „Gol z karnego”).


* 
**Operator**: Imię osoby wprowadzającej dane.


* 
**Timestamp**: Dokładna data i godzina rejestracji wpisu.



### 5. Tabele statystyk (`stats_football`, `stats_basketball`)

Zestawienia punktowe zawodników generowane na podstawie rozegranych meczów.

* 
**player_id**: Identyfikator zawodnika.


* 
**Zawodnik**: Imię i nazwisko zawodnika.


* 
**Mecz_[ID]**: Liczba punktów/bramek zdobytych w konkretnym meczu.


* 
**SUMA**: Łączna liczba zdobytych punktów we wszystkich meczach.