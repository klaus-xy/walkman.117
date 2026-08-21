export type Track = {
  id: string
  title: string
  artist: string
  // Drop matching audio files into /public/audio to make these play.
  src: string
}

export const tracks: Track[] = [
  {
    id: "t1",
    title: "She Could Be You",
    artist: "Shawn Hlookoff",
    src: "/audio/SheCouldBeYou.mp3",
  },
  {
    id: "t2",
    title: "Beneath Your Beautiful",
    artist: "Labrinth",
    src: "/audio/Labrinth_Beneath_Your_Beautiful.mp3",
  },
  {
    id: "t3",
    title: "Midnight City",
    artist: "M38",
    src: "/audio/M38-Midnight_City.mp3",
  },
  {
    id: "t10",
    title: "Shayo Galore",
    artist: "Wavy The Creator",
    src: "/audio/Wavy_The_Creator_Shayo_Galore.mp3",
  },

  {
    id: "t5",
    title: "Okunkun",
    artist: "Solana ft Killertunes",
    src: "/audio/Solana_ft_Killertunes-Okunkun.mp3",
  },
  {
    id: "t6",
    title: "U Made A Smart Girl Dumb!!",
    artist: "panicbaby",
    src: "/audio/Panicbaby-U_Made_A_Smart_Girl_Dumb!!.mp3",
  },
  {
    id: "t7",
    title: "Self Aware",
    artist: "Temper City",
    src: "/audio/Temper_City-Self_Aware.mp3",
  },
  {
    id: "t8",
    title: "Rock That Body",
    artist: "Black Eyed Peas",
    src: "/audio/Black_Eyes_Peas_-_Rock_That_Body_The_E.N.D.mp3",
  },
  {
    id: "t9",
    title: "I Wonder",
    artist: "Kanye West",
    src: "/audio/Kanye_West-I_Wonder.mp3",
  },
  {
    id: "t4",
    title: "Prairies",
    artist: "BoyWithUke",
    src: "/audio/Boywithuke-Prairies.mp3",
  },
  {
    id: "t11",
    title: "Outro",
    artist: "M83",
    src: "/audio/M83-Outro.mp3",
  },
]
