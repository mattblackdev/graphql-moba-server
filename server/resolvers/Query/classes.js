import { Classes, Skills } from '/imports/api/collections'

export function classes() {
  const skills = Skills.find({}).fetch()
  const clazzes = Classes.find({})
    .fetch()
    .map(clazz => {
      const populatedSkills = clazz.skills.map(skillId =>
        skills.find(skill => skill._id === skillId)
      )
      return {
        ...clazz,
        skills: populatedSkills,
      }
    })

  return clazzes
}
