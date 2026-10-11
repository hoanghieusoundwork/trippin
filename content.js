/* Ongoing content: add verified projects and notes here.
Project: { id, title, category:'production'|'composition'|'mix-master', year, role,
  description, credits, audio:'assets/file.mp3', artwork:'assets/cover.jpg' }
Multiple roles: add categories:['production','mix-master'].
Game demo: {title, game, role, description, credits, video, poster}.
Note: { title, date, body }. Contact links require confirmation. */
window.TRIPPIN = {
 projects: [],
 notes: [],
 gameDemos: [
  { title: 'GOSU — Sound Redesign', game: 'Thử nghiệm thiết kế lại âm thanh gameplay', role: 'Tắt âm thanh gốc và tái dựng hiệu ứng chiến đấu, môi trường và nhân vật.', description: 'Demo thực hành, chưa phải bản mix cuối. Nhạc nền được thử nghiệm bằng Suno và Udio.', credits: 'Hình ảnh: gameplay GOSU. Nhạc nền trong demo: AI (Suno, Udio), không phải nhạc tôi tự sản xuất.', link: 'https://drive.google.com/drive/folders/1iLduOGDDWuezFXaPa_Aza2dfhVE_tjVw?usp=drive_link' }
 ],
 profile: { heroImage: '', heroAlt: '', heroCaption: '', portrait: '' },
 contact: { email: 'trippin.sb@gmail.com', instagram: '' }
};
