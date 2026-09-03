hôm nay chúng ta sẽ làm task: tạo hệ thống từ vựng cho phần từ vựng
bối cảnh:
người dùng sẽ muốn vào web để học từ vựng. học từ vựng và học kanji là 2 phần hoàn toàn khác nhau

tôi có suy nghĩ về hệ thống từ vựng như sau(về mặt công nghệ)
-từ vựng Nhật cấu thành từ kanji và hiragana, từ mượn thì mới dùng đến katakana
chúng ta sẽ có object kanji là con của từ vựng
kanji:
{
  "character": "無",
  "onyomi": ["む", "ぶ"],
  "kunyomi": ["ない"],
  "hanViet": "Vô",
  "meanings": ["vô lý", "không"],
  "mnemonic": "Hình phạt bắt người nằm 𠂉 trên giàn 卌 lửa 灬 thiêu thật quá vô 無 lý",
  "notes": "Nhớ bộ hoả 4 chấm nên dàn củi trên cũng có 4 cây đứng thêm 2 cây ngang cho chắc",
  "examples": [
    "無休",
    "無理",
    "無料",
    "無い",
    "無事"
  ]
}
còn từ vựng thì sẽ có params:
{
  "id": "voca_001",
  "word": "無料",
  "reading": "むりょう",
  "romaji": "muryou",
  "meanings": ["miễn phí", "không tốn phí"],
  "partOfSpeech": ["Danh từ", "Tính từ đuôi な"],
  "kanjiComponents": ["無", "料"],
  "hanViet": "Vô Liệu",
  "jlptLevel": "N4",
  "examples": [
    {
      "sentence": "このアプリは無料でダウンロードできます。",
      "reading": "このアプリはむりょうでダウンロードできます。",
      "translation": "Ứng dụng này có thể tải xuống miễn phí."
    }
  ],
  "synonyms": ["タダ"],
  "antonyms": ["有料"]
}
sở dĩ tôi phân ra là vì phần học từ vựng sẽ là thế mạnh của web chúng ta, bao gồm flash card/kanji/kiểm tra/thi đấu/lộ trình học. Nên phải kĩ lưỡng

các task nhỏ hôm nay như sau:
YÊU CẦU QUAN TRỌNG: xem lại cấu trúc data từ vựng nữa, để ta có thể thêm vào những cái cần thiết khác, lưu ý bạn có quyền phản biện, ý tưởng của tôi cũng chưa là mệnh lệnh cuối, sau khi bạn và tôi thống nhất, chúng ta sẽ làm việc
1. tạo BE upload kanji / từ vựng
2. ở dashboard admin, tạo mục thêm từ vựng/ kanji
3. sau khi có chỗ thêm từ vựng, chúng ta sẽ thiết kế cách học cho user hay còn gọi là luồng hoạt động.
-đầu tiên: phía dev -> tạo 2 dạng hệ thống từ (phần từ vựng) đó là hệ thống "từ vựng theo bài" tức là bài 1 có 20 từ lộn xộn miễn là cho đủ kiến thức bài đó, dạng 2 là "hệ thống theo chủ đề": Động vật, thực vật, hành động trạng thái, hành động chủ động,v.v. vậy nó sẽ liên quan đến params topic của từ vựng, bạn check database xem có field này không. thiết kế cho user chỗ để lưu cho hôm sau, ví dụ hôm nay học bài 1, mai học bài 2, DÙNG TÍNH NĂNG KÉO THẢ cho nó tăng trải nghiệm tốt. và học thuộc sẽ được chuỗi, vd 2 ngày đều thuộc 20 từ, sẽ được chuỗi 2. (chuỗi được duyệt từ 5 từ trở lên)
-phía user: thao tác sẽ là vào phần từ vựng. chọn hệ thống (theo bài hoặc theo chủ đề, cả 2 đều theo mức độ JLPT, topic cũng có động vật JLPT N5, N$,..), giả sử chọn bài 1: 20 từ, đây sẽ là 1 card "bộ từ vựng", card bộ từ vựng là "bài 1 N5" hoặc "động vật" trong card mở ra sẽ là 1 bảng bao gồm các cột như những web học từ vựng khác: Từ vựng/ Nghĩa/...
nhưng tôi muốn hôm nay chỉ học 10 từ của "Bài 1 N5" thì tôi tick vào bảng rồi kéo chuột vào bảng lộ trình ngày 1, 10 từ tiếp theo kéo vào bảng ngày 2, nhấn nút "LƯU Lộ Trình" để qua page lo-trinh, ở đây tôi học ngày 1: chọn phương pháp: học bằng flashcard, bắt chước Quizlet cho tôi. TÍNH NĂNG ĐẶC BIỆT của web chúng ta là ôn từ vựng. sẽ có 1 nút tính năng ôn, tick vào thì những từ  hay quên ở ngày 1 sẽ được hỏi ở ngày 2, (dù nó nằm trong ngày 1), sang ngày 3, sẽ hỏi lại 1/4 ngày 1, ngày 4 sẽ hỏi 1/4 ngày 1, 1/4 ngày 2, từ vựng hay quên của ngày 3
4. khoan hẵn làm page kanji.
5. trước khi làm, xem qua toàn bộ những file liên quan đến page vừa tạo, ý tôi là những nơi navigate qua page từ vựng
6. reponsive thật mượt ở điện thoại để user duy trì streak.



