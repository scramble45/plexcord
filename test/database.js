const chatBot = require('../services/chat-bot')
const should  = require("chai").should()

describe("Chat BOT library list", () => {
  let rows = []
  before((done) => {
    chatBot.libraryList(null, (err, results) => {
      if (err) return err
      rows = results
      done()
    })
  })

  it("should have 2 results", () => {rows.length.should.equal(2)})
})

describe("Chat BOT file info", () => {
  let rows = []
  before((done) => {
    chatBot.fileInfo(5, (err, results) => {
      if (err) return err
      rows = results
      done()
    })
  })

  it("should have 2 results", () => {rows.length.should.equal(1)})
  it("should have correct movie title", () => {rows[0].embed.title.should.equal("2001: A Space Odyssey")})
  it("should have 6 results", () => {rows[0].embed.fields.length.should.equal(6)})
})

describe("Chat BOT id description", () => {
  let rows = []
  before((done) => {
    chatBot.description(5, (err, results) => {
      if (err) return err
      rows = results
      done()
    })
  })

  it("should have 2 results", () => {rows.length.should.equal(1)})
  it("should have correct movie title", () => {rows[0].embed.title.should.equal("2001: A Space Odyssey")})
  it("should have correct movie summary", () => {rows[0].embed.fields[1].value.should.equal("Humanity finds a mysterious object buried beneath the lunar surface and sets off to find its origins with the help of HAL 9000, the world's most advanced super computer.")})
  it("should have correct file size", () => {rows[0].embed.fields[2].value.should.equal("9.8 GB")})
  it("should have correct file hash", () => {rows[0].embed.fields[3].value.should.equal("`f977d0e5f99fd7eaadb162af01974806ad1c1474`")})
  it("should have 4 results", () => {rows[0].embed.fields.length.should.equal(4)})
})
